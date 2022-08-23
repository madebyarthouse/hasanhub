import { prisma } from "~/utils/prisma.server";
import { json } from "@remix-run/node";
import { debug } from "~/utils/debug.server";
import { matchTagWithVideos } from "~/sync/services/matching";
import { Video } from "@prisma/client";

export async function loader({ params }) {
  try {
    const [tags, videos] = await Promise.all([
      prisma.tag.findMany(),
      prisma.video.findMany(),
    ]);

    let taggedVideos: { [key: string]: number } = {};
    await prisma.$transaction(
      tags.map((tag) => {
        const filteredVideos = videos.filter((video) => {
          if (tag.lastedMatchedAt === null || video.publishedAt === null) {
            return true;
          }

          return video.createdAt >= tag.lastedMatchedAt;
        });

        debug(`Videos for ${tag.name} filtered: ${filteredVideos.length}, `);

        const matchedVideos = matchTagWithVideos(tag, filteredVideos);
        taggedVideos[tag.name] = matchedVideos.length;

        debug(`${tag.name} matched ${matchedVideos.length} videos`);

        return prisma.tag.update({
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
      })
    );

    return json(taggedVideos);
  } catch (e) {
    debug(e);
    return json({ error: e }, 500);
  } finally {
    prisma.$disconnect();
  }
}
