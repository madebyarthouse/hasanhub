import type { Channel, Playlist } from "@prisma/client";
import { decode } from "html-entities";
import {
  searchChannels,
  searchPlaylists,
  searchVideos,
} from "./_youtube.server";
import matchTagsAndVideos from "./_matchTagsAndVideosService";
import refreshVideosData from "./_refreshVideoData";
import type {
  SearchVideosResponseType,
  YTChannelSnippet,
  YTPlaylistSnippet,
  YTVideoItem,
} from "./_youtube.server";
import { prisma } from "./_prisma.server";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const ytChannelDTO = (ytData: YTChannelSnippet) => {
  return {
    title: decode(ytData?.snippet?.title),
    description: ytData?.snippet?.description,
    publishedAt: new Date(ytData?.snippet?.publishedAt),
    bannerUrl: ytData?.brandingSettings?.image?.bannerExternalUrl,
    keywords: ytData?.brandingSettings?.channel?.keywords,
    smallThumbnailUrl: ytData?.snippet?.thumbnails?.default?.url,
    mediumThumbnailUrl: ytData?.snippet?.thumbnails?.medium?.url,
    largeThumbnailUrl: ytData?.snippet?.thumbnails?.high?.url,
    viewCount: parseInt(ytData?.statistics?.viewCount),
    subscriberCount: parseInt(ytData?.statistics?.subscriberCount),
    youtubeId: ytData?.id,
  };
};

const ytPlaylistDTO = (ytData: YTPlaylistSnippet) => {
  return {
    title: decode(ytData?.snippet?.title),
    description: decode(ytData?.snippet?.description),
    publishedAt: new Date(ytData?.snippet?.publishedAt),
    smallThumbnailUrl: ytData?.snippet?.thumbnails?.default?.url,
    mediumThumbnailUrl: ytData?.snippet?.thumbnails?.medium?.url,
    largeThumbnailUrl: ytData?.snippet?.thumbnails?.high?.url,
    xlThumbnailUrl: ytData?.snippet?.thumbnails?.standard?.url,
    xxlThumbnailUrl: ytData?.snippet?.thumbnails?.maxres?.url,
  };
};

const ytVideoDTO = (ytData: YTVideoItem, channel: Channel) => {
  return {
    youtubeId: ytData?.id?.videoId,
    title: decode(ytData?.snippet?.title),
    description: ytData?.snippet?.description,
    publishedAt: new Date(ytData?.snippet?.publishedAt),
    smallThumbnailUrl: ytData?.snippet?.thumbnails?.default?.url,
    mediumThumbnailUrl: ytData?.snippet?.thumbnails?.medium?.url,
    largeThumbnailUrl: ytData?.snippet?.thumbnails?.high?.url,
    channelId: channel.id,
  };
};

const getLatestVideosFromChannel = async (
  channelId: number
): Promise<string[]> => {
  const videos = await prisma.video.findMany({
    where: { channelId: channelId },
    orderBy: { publishedAt: "desc" },
    select: { youtubeId: true },
    take: 55,
  });

  if (videos === null) {
    return [];
  } else {
    return videos.map((video) => video.youtubeId);
  }
};

const videosContainLatestOrDisabledVideos = (
  videos: YTVideoItem[],
  latestVideos: string[]
) => {
  return videos.some((video) => latestVideos.includes(video.id.videoId));
};

// Filter out videos which are already in database
const filterVideos = (videos: YTVideoItem[], latestVideos: string[]) => {
  return videos.filter((video) => {
    return video.id.videoId && !latestVideos.includes(video.id.videoId);
  });
};

const fetchNewVideos = async (channel: Channel) => {
  const latestVideos = await getLatestVideosFromChannel(channel.id);

  let videos: YTVideoItem[] = [];
  let ytChannelVideosResponse: SearchVideosResponseType | null = null;
  do {
    ytChannelVideosResponse = (
      await searchVideos({
        part: "snippet,id",
        channelId: channel.youtubeId,
        ...(ytChannelVideosResponse
          ? {
              pageToken: ytChannelVideosResponse?.nextPageToken,
            }
          : {}),
      })
    )?.data;

    if ("error" in ytChannelVideosResponse) {
      console.log(ytChannelVideosResponse);
      continue;
    }

    if (ytChannelVideosResponse.items.length === 0) {
      console.log(
        `Channel '${channel.title}' with Youtube ID = '${channel.youtubeId}' has no videos.`
      );
      continue;
    }

    videos = videos.concat(ytChannelVideosResponse.items);
  } while (
    ytChannelVideosResponse.nextPageToken !== null &&
    ytChannelVideosResponse.nextPageToken !== undefined &&
    !videosContainLatestOrDisabledVideos(videos, latestVideos)
  );

  return filterVideos(videos, latestVideos);
};

const processChannel = async (channel: Channel) => {
  const ytChannel = (
    await searchChannels({ part: "snippet,id", id: channel.youtubeId })
  )?.data;

  if ("error" in ytChannel) {
    console.log(
      `Error '${ytChannel.error}' while searching channel ${channel.youtubeId}`
    );
    return;
  }

  if (!("items" in ytChannel) || ytChannel.items?.length === 0) {
    console.log(
      `Channel '${channel.title}' with Youtube ID = '${channel.youtubeId}' was not found.`
    );
    return;
  }

  const updated = await prisma.channel.update({
    where: { id: channel.id },
    data: ytChannelDTO(ytChannel.items[0]),
  });

  console.log(
    `Channel '${updated.title}' with Youtube ID = '${updated.youtubeId}' was updated.`
  );
  return updated;
};

const processPlaylist = async (playlist: Playlist) => {
  const ytPlaylist = (
    await searchPlaylists({ part: "snippet,id", id: playlist.youtubeId })
  )?.data;

  if ("error" in ytPlaylist) {
    console.log(
      `Error '${ytPlaylist.error}' while searching channel ${playlist.youtubeId}`
    );
    return;
  }

  if (ytPlaylist.items.length === 0) {
    console.log(
      `Channel '${playlist.title}' with Youtube ID = '${playlist.youtubeId}' was not found.`
    );
    return;
  }

  const updated = await prisma.playlist.update({
    where: { id: playlist.id },
    data: ytPlaylistDTO(ytPlaylist.items[0]),
  });

  console.log(
    `Playlist '${updated.title}' with Youtube ID = '${updated.youtubeId}' was updated.`
  );

  return updated;
};

function getUniqueVideos(
  arr: Awaited<ReturnType<typeof ytVideoDTO>>[],
  key: string
) {
  return [...new Map(arr.map((item) => [item.youtubeId, item])).values()];
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const responseString: String[] = [];
  try {
    const [channels, tags, playlists] = await Promise.all([
      prisma.channel.findMany(),
      prisma.tag.findMany(),
      prisma.playlist.findMany(),
    ]);

    const data: {
      newVideos: ReturnType<typeof ytVideoDTO>[];
      channel: Channel;
    }[] = [];
    for (const channel of channels) {
      await processChannel(channel);

      const videosData = (await fetchNewVideos(channel)).map((video) =>
        ytVideoDTO(video, channel)
      );

      await prisma.video.createMany({
        data: getUniqueVideos(videosData, "youtubeId"),
      });

      data.push({ newVideos: videosData, channel });
    }

    for (const playlist of playlists) {
      await processPlaylist(playlist);
    }

    const newVideoYTIds: string[] = [];
    for (const dataItem of data) {
      dataItem.newVideos.forEach((newVideo) => {
        responseString.push(
          `${newVideo.title} was added to ${dataItem.channel.title}`
        );

        newVideoYTIds.push(newVideo.youtubeId);
      });
    }

    const newVideos = await prisma.video.findMany({
      where: { youtubeId: { in: newVideoYTIds } },
    });

    const updated = await refreshVideosData(newVideos);

    const tagVideoData = matchTagsAndVideos(tags, newVideos);
    for (const [tagId, data] of Object.entries(tagVideoData)) {
      if (data.length > 0) {
        await prisma.tag.update({
          where: { id: parseInt(tagId) },
          data: {
            videos: { createMany: { data: data, skipDuplicates: true } },
          },
        });
        responseString.push(`${data.length} videos were added to tag ${tagId}`);
      }
    }
  } catch (error) {
    responseString.push(error as String);
    prisma.$disconnect();
  }

  prisma.$disconnect();

  response.status(200).send(responseString.join("\n"));
}
