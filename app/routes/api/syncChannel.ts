import { PublishStatus, VideoSyncStatus } from "@prisma/client";
import { json } from "@remix-run/node";
import type { YoutubeVideoSearchItem } from "youtube.ts";
import { z } from "zod";
import { getChannelVideos } from "~/sync/clients/youtubeApi.server";
import { prisma } from "~/utils/prisma.server";
import { debug } from "~/utils/debug.server";
import { matchTagWithVideos } from "~/sync/services/matching";
import { decode } from "html-entities";

export async function loader({ request }) {
  const url = new URL(request.url);
  let id = z.string().parse(url.searchParams.get("id"));

  debug(`Channel ID: ${id}`);
  const [channel, latestVideos] = await Promise.all([
    prisma.channel.findUnique({
      where: { youtubeId: id },
    }),
    getLatestVideosFromChannel(id),
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
  let resultsFetched = 0;
  let response;
  do {
    response = await getChannelVideos(channel.youtubeId, nextPageToken);

    debug(response.items.length);

    nextPageToken = response.nextPageToken;
    resultsFetched += response.pageInfo.resultsPerPage;
    videosResponse = videosResponse.concat(response.items);
  } while (
    nextPageToken &&
    resultsFetched < response.pageInfo.totalResults &&
    !videosContainLatestOrDisabledVideos(videosResponse, latestVideos)
  );

  debug(`${videosResponse.length} videos from channel fetched.`);

  const newVideosResponse = filterVideos(videosResponse, latestVideos);

  debug(`${newVideosResponse.length} new videos found.`);

  try {
    const newVideos = await prisma.$transaction(
      newVideosResponse.map((videoData) => {
        return prisma.video.create({
          data: {
            title: decode(videoData.snippet.title),
            youtubeId: videoData.id.videoId,
            description: decode(videoData.snippet.description),
            publishedAt: videoData.snippet.publishedAt,
            smallThumbnailUrl: videoData.snippet.thumbnails.default.url,
            mediumThumbnailUrl: videoData.snippet.thumbnails.medium.url,
            largeThumbnailUrl: videoData.snippet.thumbnails.high.url,
            syncStatus: VideoSyncStatus.Full,
            publishStatus: PublishStatus.Published,
            channelId: channel.id,
          },
        });
      })
    );

    if (newVideos.length > 0) {
      const tags = await prisma.tag.findMany();

      tags.map(async (tag) => {
        const matchedVideos = matchTagWithVideos(tag, newVideos);

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
      });
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

const getLatestVideosFromChannel = async (
  youtubeId: string
): Promise<string[]> => {
  const videos = await prisma.video.findMany({
    where: {
      channel: {
        youtubeId: youtubeId,
      },
    },
    orderBy: { publishedAt: "desc" },
    select: { youtubeId: true },
    take: 100,
  });

  if (videos === null) {
    return [];
  } else {
    return videos.map((video) => video.youtubeId);
  }
};

const videosContainLatestOrDisabledVideos = (
  videos: YoutubeVideoSearchItem[],
  latestVideos: string[]
) => {
  return videos.some((video) => latestVideos.includes(video.id.videoId));
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
