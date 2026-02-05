import { parse, toSeconds } from "iso8601-duration";
import { decode } from "html-entities";
import { and, desc, eq, gt, lt, or } from "drizzle-orm";
import type { YoutubeVideo } from "~/sync/clients/youtube-api.server";
import { getVideo } from "~/sync/clients/youtube-api.server";
import { publishStatus, videoSyncStatus } from "~/utils/dbEnums";
import { chunkAndMergePromises } from "~/utils";
import { Video } from "../../../db/schema";
import { db } from "../../../db/client";

const minute = 1000 * 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;

export const syncVideos = async () => {
  const now = Date.now();
  const videos = await db
    .select()
    .from(Video)
    .where(
      or(
        eq(Video.syncStatus, videoSyncStatus.Snippet),
        and(
          gt(Video.publishedAt, new Date(now - day).toISOString()),
          lt(Video.updatedAt, new Date(now - hour * 4).toISOString())
        ),
        and(
          gt(Video.publishedAt, new Date(now - week).toISOString()),
          lt(Video.updatedAt, new Date(now - day).toISOString())
        ),
        and(
          gt(Video.publishedAt, new Date(now - week * 4).toISOString()),
          lt(Video.updatedAt, new Date(now - week * 2).toISOString())
        ),
        and(
          gt(Video.publishedAt, new Date(now - week * 12).toISOString()),
          lt(Video.updatedAt, new Date(now - week * 6).toISOString())
        )
      )
    )
    .orderBy(desc(Video.publishedAt))
    .limit(75);

  console.log("syncVideos:requested", {
    count: videos.length,
    sample: videos.slice(0, 20).map((video) => video.youtubeId),
    truncated: videos.length > 20,
  });

  const videosResponse = await Promise.all(
    videos.map(async (video) => {
      try {
        return await getVideo(video.youtubeId);
      } catch (error) {
        console.warn("syncVideos:fetchFailed", {
          youtubeId: video.youtubeId,
          error: String(error),
        });
        await db
          .update(Video)
          .set({ publishStatus: publishStatus.Unpublished })
          .where(eq(Video.id, video.id));
        return null;
      }
    })
  );

  const videosData = videosResponse.filter(
    (video) => video !== null
  ) as YoutubeVideo[];

  console.log("syncVideos:fetched", {
    count: videosData.length,
    sample: videosData.slice(0, 20).map((video) => ({
      id: video.id,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt,
    })),
    truncated: videosData.length > 20,
  });

  const updated = await chunkAndMergePromises(
    videosData.map((videoData) => {
      return db
        .update(Video)
        .set({
          title: decode(videoData.snippet.title),
          description: decode(videoData.snippet.description),
          publishedAt: videoData.snippet.publishedAt,
          smallThumbnailUrl: videoData.snippet.thumbnails.default.url,
          mediumThumbnailUrl: videoData.snippet.thumbnails.medium.url,
          largeThumbnailUrl: videoData.snippet.thumbnails.high.url,
          xlThumbnailUrl: videoData.snippet.thumbnails.standard?.url ?? null,
          xxlThumbnailUrl: videoData.snippet.thumbnails.maxres?.url ?? null,
          comments: isNaN(parseInt(videoData.statistics.commentCount))
            ? null
            : parseInt(videoData.statistics.commentCount),
          views: isNaN(parseInt(videoData.statistics.viewCount))
            ? null
            : parseInt(videoData.statistics.viewCount),
          likes: isNaN(parseInt(videoData.statistics.likeCount))
            ? null
            : parseInt(videoData.statistics.likeCount),
          duration: videoData.contentDetails.duration
            ? toSeconds(parse(videoData.contentDetails.duration)) ?? null
            : null,
          syncStatus: videoSyncStatus.Full,
          publishStatus: publishStatus.Published,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(Video.youtubeId, videoData.id));
    }),
    5
  );

  console.log("syncVideos:updated", {
    count: videosData.length,
    sample: videosData.slice(0, 20).map((video) => video.id),
    truncated: videosData.length > 20,
  });

  return {
    fetched: videos.length,
    found: videosData.length,
    synced: updated.length,
  };
};
