import type { Video } from "@prisma/client";
import { json } from "@remix-run/node";
import type { YoutubeVideoSearchItem } from "youtube.ts";
import { z } from "zod";
import { getChannelVideos } from "~/sync/clients/youtube-api.server";
import { prisma } from "~/utils/prisma.server";
import { debug } from "~/utils/debug.server";
import { matchTagWithVideos } from "~/sync/services/matching";
import { decode } from "html-entities";
import { publishStatus, videoSyncStatus } from "~/utils/dbEnums";

export const config = {
  maxDuration: 120,
};

export async function loader({ request }) {
  const url = new URL(request.url);
  let id = z.string().parse(url.searchParams.get("id"));

  debug(`Channel ID: ${id}`);
  const [channel, channelVideos] = await Promise.all([
    prisma.channel.findUnique({
      where: { youtubeId: id },
    }),
    getVideosFromChannel(id),
  ]);

  if (channel === null) {
    debug(`Channel with Youtube ID = '${id}' not found.`);
    return json({ error: "Channel not found." });
  }

  debug(
    `Channel '${channel.title}' with Youtube ID = '${channel.youtubeId}' will be synced.`
  );

  let nextPageToken;
  let videosResponse: YoutubeVideoSearchItem[] = [];
  let response;
  do {
    response = await getChannelVideos(channel.youtubeId, nextPageToken);
    videosResponse = videosResponse.concat(response.items);

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  debug(`${videosResponse.length} videos from channel fetched.`);

  const newVideosResponse = filterVideos(videosResponse, channelVideos);

  debug(`${newVideosResponse.length} new videos found.`);

  try {
    const transactions = newVideosResponse.map((videoData) => {
      return prisma.video.upsert({
        where: { youtubeId: videoData.id.videoId },
        update: {},
        create: {
          title: decode(videoData.snippet.title),
          youtubeId: videoData.id.videoId,
          description: decode(videoData.snippet.description),
          publishedAt: videoData.snippet.publishedAt,
          smallThumbnailUrl: videoData.snippet.thumbnails.default.url,
          mediumThumbnailUrl: videoData.snippet.thumbnails.medium.url,
          largeThumbnailUrl: videoData.snippet.thumbnails.high.url,
          syncStatus: videoSyncStatus.Snippet,
          publishStatus: publishStatus.Published,
          channelId: channel.id,
        },
      });
    });

    const newVideos = await batchTransactions(transactions, 50);

    debug(newVideos.length);

    if (newVideos.length > 0) {
      const tags = await prisma.tag.findMany();

      await Promise.allSettled(
        tags.map(async (tag) => {
          const matchedVideos = matchTagWithVideos(tag, newVideos);
          debug(`${tag.name} matched ${matchedVideos.length} videos`);

          const tagVideos = await prisma.tagVideo.findMany({
            where: { tagId: tag.id },
            select: { videoId: true },
          });

          const tagVideoIds = tagVideos.map((tagVideo) => tagVideo.videoId);

          const newTagVideos = matchedVideos.filter(
            (matchedVideo) => !tagVideoIds.includes(matchedVideo.id)
          );

          if (newTagVideos.length > 0) {
            debug(
              `New videos for tag ${tag.name}: ${newTagVideos.length}, updating tag.`
            );
          }

          if (matchedVideos.length > 0) {
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
        })
      );
    }

    debug(`${newVideos.length} videos added.`);

    return json({ videos: newVideos.length });
  } catch (e) {
    debug(e);
    return json({ error: e });
  } finally {
    prisma.$disconnect();
  }
}

const getVideosFromChannel = async (youtubeId: string): Promise<string[]> => {
  const videos = await prisma.video.findMany({
    where: {
      channel: {
        youtubeId: youtubeId,
      },
    },
    orderBy: { publishedAt: "desc" },
    select: { youtubeId: true },
  });

  if (videos === null) {
    return [];
  } else {
    return videos.map((video) => video.youtubeId);
  }
};

// Filter out videos which are already in database
const filterVideos = (
  videos: YoutubeVideoSearchItem[],
  latestVideos: string[]
) => {
  return videos.filter((video) => {
    return !latestVideos.includes(video.id.videoId);
  });
};

const batchTransactions = async (
  videos: ReturnType<typeof prisma.video.create>[],
  batchSize: number
) => {
  const batches: (typeof videos)[] = [];
  for (let i = 0; i < videos.length; i += batchSize) {
    batches.push(videos.slice(i, i + batchSize));
  }

  let transactionResults: Video[] = [];
  for (const batch of batches) {
    transactionResults = transactionResults.concat(
      await prisma.$transaction(batch)
    );
  }

  return transactionResults;
};
