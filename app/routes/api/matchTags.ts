import { prisma } from "~/utils/prisma.server";
import { json } from "@remix-run/node";
import { debug } from "~/utils/debug.server";
import { matchTagWithVideos } from "~/sync/services/matching";
import type { Tag, Video } from "@prisma/client";

export const config = {
  maxDuration: 120,
};

const fetchVideosChunked = async (take: number, chunkSize: number) => {
  const videos: Video[] = [];
  for (let i = 0; i < take; i += chunkSize) {
    debug(`Fetching videos ${i} - ${i + chunkSize}`);
    const chunk = await prisma.video.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: i,
      take: chunkSize,
    });

    videos.push(...chunk);

    if (chunk.length < chunkSize) {
      break;
    }
  }
  return videos;
};

export async function loader({ params }) {
  try {
    const [tags, videos] = await Promise.all([
      prisma.tag.findMany({
        include: {
          videos: {
            take: 20000,
            select: { videoId: true },
          },
        },
      }),
      fetchVideosChunked(100000, 5000),
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

        debug(`"${tag.name}" matched ${matchedVideos.length} videos`);

        const videoIds = tag.videos.map((tagVideo) => tagVideo.videoId);
        debug(`Skipping ${videoIds.length} already matched videos`);
        debug(videoIds);
        debug(matchedVideos.map((matchedVideo) => matchedVideo.id));
        const newTagVideos = matchedVideos.filter(
          (matchedVideo) => !videoIds.includes(matchedVideo.id)
        );

        if (newTagVideos.length > 0) {
          debug(`New videos for tag "${tag.name}": ${newTagVideos.length}.`);
          // debug(
          //   newTagVideos.map((matchedVideo) => ({
          //     videoId: matchedVideo.id,
          //   }))
          // );
        }

        if (newTagVideos.length > 0) {
          return prisma.tag.update({
            where: { id: tag.id },
            data: {
              lastedMatchedAt: new Date(),
              videos: {
                createMany: {
                  data: newTagVideos.map((matchedVideo) => ({
                    videoId: matchedVideo.id,
                  })),
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
    return json({ error: JSON.stringify(e) }, 500);
  } finally {
    prisma.$disconnect();
  }
}

const batchTransactions = async (
  tags: ReturnType<typeof prisma.tag.update>[],
  batchSize: number
) => {
  const batches: (typeof tags)[] = [];
  for (let i = 0; i < tags.length; i += batchSize) {
    batches.push(tags.slice(i, i + batchSize));
  }

  let transactionResults: Tag[] = [];
  for (const batch of batches) {
    transactionResults = transactionResults.concat(
      await prisma.$transaction(batch)
    );
  }

  return transactionResults;
};
