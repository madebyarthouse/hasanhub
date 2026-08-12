import { z } from "zod";
import { and, asc, desc, eq, gte, inArray, lte, lt, gt, or, sql } from "drizzle-orm";
import { publishStatus, videoSyncStatus } from "~/utils/dbEnums";
import type {
  DurationListType,
  TimeframeType,
  LastVideoIdType,
} from "~/utils/validators";
import {
  DurationListValidator,
  TimeframeValidator,
  LastVideoIdValidator,
  OrderByValdiator,
  OrderDirectionValidator,
} from "~/utils/validators";
import { Channel, Tag, TagVideo, Video } from "../../db/schema";
import type { ReturnTypeOrDb } from "../../db/queries/types";

export const TagSlugsValidator = z.optional(z.array(z.string()));

const TakeValidator = z.optional(
  z.number({
    invalid_type_error: "take must be a number",
  })
);

type GetVideosArgs = z.infer<typeof GetVideosValidator>;

const GetVideosValidator = z.object({
  tagSlugs: TagSlugsValidator,
  take: TakeValidator,
  by: OrderByValdiator,
  order: OrderDirectionValidator,
  durations: z.optional(DurationListValidator),
  timeframe: z.optional(TimeframeValidator),
  lastVideoId: LastVideoIdValidator,
});

const getVideos = async (db: ReturnTypeOrDb, params: GetVideosArgs) => {
  const { order, durations, timeframe, by, lastVideoId, tagSlugs, take } =
    GetVideosValidator.parse(params);

  const conditions = [
    eq(Video.disabled, false),
    eq(Video.syncStatus, videoSyncStatus.Full),
    eq(Video.publishStatus, publishStatus.Published),
  ];

  if (tagSlugs && tagSlugs.length > 0) {
    const tagVideoSubquery = db
      .select({ videoId: TagVideo.videoId })
      .from(TagVideo)
      .innerJoin(Tag, eq(TagVideo.tagId, Tag.id))
      .where(inArray(Tag.slug, tagSlugs));
    conditions.push(inArray(Video.id, tagVideoSubquery));
  }

  if (lastVideoId) {
    const lastVideo = await getLastVideo(db, lastVideoId);
    const key = by ?? "publishedAt";
    const lastValue =
      key === "views"
        ? lastVideo?.views ?? null
        : key === "likes"
          ? lastVideo?.likes ?? null
          : lastVideo?.publishedAt ?? null;
    if (lastValue) {
      if ((order ?? "desc") === "asc") {
        conditions.push(
          key === "views"
            ? gt(Video.views, Number(lastValue))
            : gt(Video.publishedAt, String(lastValue))
        );
      } else {
        conditions.push(
          key === "views"
            ? lt(Video.views, Number(lastValue))
            : lt(Video.publishedAt, String(lastValue))
        );
      }
    }
  }

  if (durations) {
    const minMaxPairs = getMinxMaxForTimeFilter(durations) ?? [];
    if (minMaxPairs.length > 0) {
      conditions.push(
        or(
          ...minMaxPairs.map(([min, max]) =>
            and(gte(Video.duration, min), lte(Video.duration, max))
          )
        )
      );
    }
  }

  if (timeframe) {
    const earliestDate = getDateRangeForTimeframe(timeframe);
    if (earliestDate) {
      conditions.push(gt(Video.publishedAt, earliestDate.toISOString()));
    }
  }

  const orderKey = by ?? "publishedAt";
  const ordering =
    (order ?? "desc") === "asc"
      ? orderKey === "views"
        ? asc(Video.views)
        : asc(Video.publishedAt)
      : orderKey === "views"
        ? desc(Video.views)
        : desc(Video.publishedAt);

  const videos = await db
    .select({
      id: Video.id,
      youtubeId: Video.youtubeId,
      largeThumbnailUrl: Video.largeThumbnailUrl,
      title: Video.title,
      publishedAt: Video.publishedAt,
      views: Video.views,
      duration: Video.duration,
      channelId: Video.channelId,
      channelTitle: Channel.title,
      channelSmallThumbnailUrl: Channel.smallThumbnailUrl,
      channelYoutubeId: Channel.youtubeId,
    })
    .from(Video)
    .leftJoin(Channel, eq(Video.channelId, Channel.id))
    .where(and(...conditions))
    .orderBy(ordering)
    .limit(take ?? 25);

  const videoIds = videos.map((video) => video.id).filter(Boolean);
  const tags = videoIds.length
    ? await db
        .select({
          tagVideoId: TagVideo.id,
          tagId: Tag.id,
          videoId: TagVideo.videoId,
          tagSlug: Tag.slug,
          tagName: Tag.name,
        })
        .from(TagVideo)
        .leftJoin(Tag, eq(TagVideo.tagId, Tag.id))
        .where(inArray(TagVideo.videoId, videoIds))
    : [];

  const tagsByVideoId = new Map<number, typeof tags>();
  tags.forEach((tag) => {
    const id = tag.videoId ?? -1;
    const bucket = tagsByVideoId.get(id) ?? [];
    bucket.push(tag);
    tagsByVideoId.set(id, bucket);
  });

  const data = videos.map((video) => ({
    id: video.id,
    youtubeId: video.youtubeId,
    largeThumbnailUrl: video.largeThumbnailUrl ?? "",
    title: video.title ?? "",
    publishedAt: video.publishedAt,
    views: video.views,
    duration: video.duration,
    channel: video.channelId
      ? {
          id: video.channelId,
          title: video.channelTitle ?? "",
          smallThumbnailUrl: video.channelSmallThumbnailUrl ?? "",
          youtubeId: video.channelYoutubeId ?? "",
        }
      : null,
    tags:
      tagsByVideoId.get(video.id ?? -1)?.map((tag) => ({
        id: tag.tagVideoId ?? 0,
        tagId: tag.tagId ?? null,
        videoId: tag.videoId ?? null,
        tag: tag.tagId
          ? {
              id: tag.tagId,
              slug: tag.tagSlug,
              name: tag.tagName ?? "",
            }
          : null,
      })) ?? [],
  }));

  const countRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(Video)
    .where(and(...conditions));

  const totalVideosCount = Number(countRow[0]?.count ?? 0);

  return [data, totalVideosCount] as const;
};

const getLastVideo = async (db: ReturnTypeOrDb, lastVideoId: LastVideoIdType) => {
  if (!lastVideoId) {
    return null;
  }
  const rows = await db
    .select({
      publishedAt: Video.publishedAt,
      views: Video.views,
      likes: Video.likes,
    })
    .from(Video)
    .where(eq(Video.id, lastVideoId))
    .limit(1);

  return rows[0] ?? null;
};

const getMinxMaxForTimeFilter = (durations?: DurationListType) => {
  return durations?.map((duration) => {
    switch (duration) {
      case "short":
        return [0, 60 * 3];
      case "medium":
        return [60 * 3, 60 * 15];
      case "long":
        return [60 * 15, 60 * 30];
      case "extralong":
        return [60 * 30, 999999];
      default:
        return [0, 999999999];
    }
  });
};

const getDateRangeForTimeframe = (timeframe: TimeframeType) => {
  const now = new Date();

  switch (timeframe) {
    case "recent": // Last 24h
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "week": // Last week
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month": // Last month
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "quarter": // Last quarter (3 months)
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "year": // Last year
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
};

export default getVideos;
