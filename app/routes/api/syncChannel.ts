import { PublishStatus, VideoSyncStatus } from "@prisma/client";
import { json } from "@remix-run/node";
import type { YoutubeVideoSearchItem } from "youtube.ts";
import { z } from "zod";
import { getChannelVideos } from "~/sync/clients/youtubeApi.server";
import { prisma } from "~/utils/prisma.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  let id = z.string().parse(url.searchParams.get("id"));

  console.log(`Channel ID: ${id}`);
  const [channel, latestVideos] = await Promise.all([
    prisma.channel.findUnique({
      where: { youtubeId: id },
    }),
    getLatestVideosFromChannel(id),
  ]);

  if (channel === null) {
    console.log(`Channel with Youtube ID = '${id}' not found.`);
    return json({ error: "Channel not found." });
  }

  console.log(
    `Channel '${channel.title}' with Youtube ID = '${channel.youtubeId}' will be synced.`
  );

  let nextPageToken;
  let videosResponse: YoutubeVideoSearchItem[] = [];
  let resultsFetched = 0;
  let response;
  do {
    response = await getChannelVideos(channel.youtubeId, nextPageToken);

    console.log(response.items.length);

    nextPageToken = response.nextPageToken;
    resultsFetched += response.pageInfo.resultsPerPage;
    videosResponse = videosResponse.concat(response.items);
  } while (
    nextPageToken &&
    resultsFetched < response.pageInfo.totalResults &&
    !videosContainLatestOrDisabledVideos(videosResponse, latestVideos)
  );

  console.log(`${videosResponse.length} videos from channel fetched.`);

  const newVideosResponse = filterVideos(videosResponse, latestVideos);

  console.log(`${newVideosResponse.length} new videos found.`);

  try {
    const updated = await prisma.video.createMany({
      data: newVideosResponse.map((videoData) => ({
        title: videoData.snippet.title,
        youtubeId: videoData.id.videoId,
        description: videoData.snippet.description,
        publishedAt: videoData.snippet.publishedAt,
        smallThumbnailUrl: videoData.snippet.thumbnails.default.url,
        mediumThumbnailUrl: videoData.snippet.thumbnails.medium.url,
        largeThumbnailUrl: videoData.snippet.thumbnails.high.url,
        syncStatus: VideoSyncStatus.Full,
        publishStatus: PublishStatus.Published,
        channelId: channel.id,
      })),
    });

    console.log(`${updated.count} videos added.`);

    return json({});
  } catch (e) {
    console.log(e);
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
