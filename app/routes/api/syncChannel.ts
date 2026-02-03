import type { YoutubeVideoSearchItem } from "~/sync/clients/youtube-api.server";
import { z } from "zod";
import { decode } from "html-entities";
import { eq, inArray } from "drizzle-orm";
import { getChannelVideos } from "~/sync/clients/youtube-api.server";
import { matchTagWithVideos } from "~/sync/services/matching";
import { publishStatus, videoSyncStatus } from "~/utils/dbEnums";
import { chunkByParams } from "~/utils";
import { Channel, Tag, TagVideo, Video } from "../../../db/schema";
import { db } from "../../../db/client";
import type { ReturnTypeOrDb } from "../../../db/queries/types";
import type { Route } from "./+types/syncChannel";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const id = z.string().parse(url.searchParams.get("id"));

  const [channel] = await db
    .select()
    .from(Channel)
    .where(eq(Channel.youtubeId, id))
    .limit(1);

  if (!channel) {
    return new Response(JSON.stringify({ error: "Channel not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  let nextPageToken: string | undefined;
  let videosResponse: YoutubeVideoSearchItem[] = [];
  do {
    const response = await getChannelVideos(channel.youtubeId, nextPageToken);
    videosResponse = videosResponse.concat(response.items);
    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  console.log("syncChannel:fetched", {
    channelId: channel.youtubeId,
    fetchedCount: videosResponse.length,
    sample: videosResponse.slice(0, 20).map((video) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt,
    })),
    truncated: videosResponse.length > 20,
  });

  const channelVideos = await getVideosFromChannel(db, channel.id);
  const newVideosResponse = filterVideos(videosResponse, channelVideos);

  try {
    const newVideoRows = newVideosResponse.map((videoData) => ({
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
      createdAt: new Date().toISOString(),
    }));

    const videoChunks = chunkByParams(newVideoRows);
    for (const chunk of videoChunks) {
      await db.insert(Video).values(chunk).onConflictDoNothing();
    }

    if (newVideoRows.length > 0) {
      console.log("syncChannel:inserted", {
        channelId: channel.youtubeId,
        insertedCount: newVideoRows.length,
        sample: newVideoRows.slice(0, 20).map((video) => ({
          youtubeId: video.youtubeId,
          title: video.title,
          publishedAt: video.publishedAt,
        })),
        truncated: newVideoRows.length > 20,
      });
    }

    const newVideoIds = newVideosResponse.map((video) => video.id.videoId);
    const newVideos = newVideoIds.length
      ? await db
          .select()
          .from(Video)
          .where(inArray(Video.youtubeId, newVideoIds))
      : [];

    let tagVideoInsertCount = 0;

    if (newVideos.length > 0) {
      const tags = await db.select().from(Tag);
      await Promise.allSettled(
        tags.map(async (tag) => {
          const matchedVideos = matchTagWithVideos(tag, newVideos);

          const tagVideos = await db
            .select({ videoId: TagVideo.videoId })
            .from(TagVideo)
            .where(eq(TagVideo.tagId, tag.id));

          const tagVideoIds = tagVideos
            .map((tagVideo) => tagVideo.videoId)
            .filter(Boolean) as number[];

          const newTagVideos = matchedVideos.filter(
            (matchedVideo) => !tagVideoIds.includes(matchedVideo.id)
          );

          await db
            .update(Tag)
            .set({ lastedMatchedAt: new Date().toISOString() })
            .where(eq(Tag.id, tag.id));

          if (newTagVideos.length > 0) {
            const tagVideoRows = newTagVideos.map((matchedVideo) => ({
              tagId: tag.id,
              videoId: matchedVideo.id,
            }));
            const tagVideoChunks = chunkByParams(tagVideoRows);
            for (const chunk of tagVideoChunks) {
              await db.insert(TagVideo).values(chunk).onConflictDoNothing();
            }
            tagVideoInsertCount += newTagVideos.length;
          }
        })
      );
    }

    console.log("syncChannel:tagMatches", {
      channelId: channel.youtubeId,
      newVideosCount: newVideos.length,
      newTagVideoCount: tagVideoInsertCount,
    });

    return new Response(JSON.stringify({ videos: newVideos.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const getVideosFromChannel = async (
  db: ReturnTypeOrDb,
  channelId: number
): Promise<string[]> => {
  const videos = await db
    .select({ youtubeId: Video.youtubeId })
    .from(Video)
    .where(eq(Video.channelId, channelId));

  return videos.map((video) => video.youtubeId);
};

const filterVideos = (
  videos: YoutubeVideoSearchItem[],
  latestVideos: string[]
) => {
  return videos.filter((video) => !latestVideos.includes(video.id.videoId));
};
