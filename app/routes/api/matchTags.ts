import { prisma } from "~/utils/prisma.server";
import { json } from "@remix-run/node";
import { debug } from "~/utils/debug.server";
import { matchTagWithVideos } from "~/sync/services/matching";

export async function loader({ params }) {
  try {
    const [tags, videos] = await Promise.all([
      prisma.tag.findMany(),
      prisma.video.findMany(),
    ]);

    const matched = await Promise.all(
      tags.map(async (tag) => {
        const filteredVideos = videos.filter((video) => {
          if (tag.lastedMatchedAt === null || video.publishedAt === null) {
            return true;
          }

          return video.publishedAt > tag.lastedMatchedAt;
        });

        debug(`Videos for ${tag.name} filtered: ${filteredVideos.length}, `);

        const matchedVideos = matchTagWithVideos(tag, filteredVideos);

        await prisma.tag.update({
          where: { id: tag.id },
          data: {
            lastedMatchedAt: new Date(),
            videos: {
              createMany: {
                data: matchedVideos.map((matchedVideo) => ({
                  videoId: matchedVideo.id,
                })),
                skipDuplicates: true,
              },
            },
          },
        });

        debug(`${tag.name} matched ${matchedVideos.length} videos`);

        return { [tag.name]: matchedVideos.length };
      })
    );

    return json(Object.assign({}, ...matched));
  } catch (e) {
    debug(e);
    return json({ error: e }, 500);
  } finally {
    prisma.$disconnect();
  }
}
