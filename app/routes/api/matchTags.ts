import { prisma } from "~/utils/prisma.server";
import { json } from "@remix-run/node";
import { debug } from "~/utils/debug.server";
import { matchTagWithVideos } from "~/sync/services/matching";
import type { Tag } from "@prisma/client";

export async function loader() {
  try {
    const [tags, videos] = await Promise.all([
      prisma.tag.findMany(),
      prisma.video.findMany(),
    ]);

    let taggedVideos: { [key: string]: number } = {};
    await batchTransactions(
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

        if (matchedVideos.length > 0) {
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
        } else {
          return prisma.tag.update({
            where: { id: tag.id },
            data: {
              lastedMatchedAt: new Date(),
            },
          });
        }
      }),
      10
    );

    return json(taggedVideos);
  } catch (e) {
    debug(e);
    return json({ error: e }, 500);
  } finally {
    prisma.$disconnect();
  }
}

const batchTransactions = async (
  tags: ReturnType<typeof prisma.tag.update>[],
  batchSize: number
) => {
  const batches: typeof tags[] = [];
  for (let i = 0; i < tags.length; i += batchSize) {
    batches.push(tags.slice(i, i + batchSize));
  }

  let transactionResults: Tag[] = [];
  for (const batch of batches) {
    console.log(batch.length);
    transactionResults = transactionResults.concat(
      await prisma.$transaction(batch)
    );
  }

  return transactionResults;
};
