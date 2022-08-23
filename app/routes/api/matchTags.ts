import { prisma } from "~/utils/prisma.server";
import type { Tag, Video } from "@prisma/client";
import { json } from "@remix-run/node";
import { debug } from "~/utils/debug.server";

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

const splitMyString = (str: string, splitLength: number) => {
  let a = str.split(" "),
    b = [];
  a = a.filter(function (e) {
    return e.length > 0;
  });
  while (a.length) b.push(a.splice(0, splitLength).join(" "));
  return b;
};

const matchTagWithVideos = (tag: Tag, videos: Video[]) => {
  return videos.filter((video) => {
    const sanitizedTitle: string = video.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, " ");

    const synonyms = tag.synonyms.split(",");

    return synonyms.some((synonym) => {
      return (
        splitMyString(sanitizedTitle, 1).includes(synonym) ||
        splitMyString(sanitizedTitle, 2).includes(synonym) ||
        splitMyString(sanitizedTitle, 3).includes(synonym)
      );
    });
  });
};
