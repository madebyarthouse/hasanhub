import { z } from "zod";
import { publishStatus, videoSyncStatus } from "~/utils/dbEnums";
import { prisma } from "~/utils/prisma.server";
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

const getVideos = async (params: GetVideosArgs) => {
  const { order, durations, timeframe, by, lastVideoId, tagSlugs, take } =
    GetVideosValidator.parse(params);

  let conditions: {
    tags?: object;
    publishedAt?: object;
    views?: object;
    likes?: object;
    OR?: Array<object>;
    disabled: boolean;
    syncStatus: typeof videoSyncStatus.Full;
    publishStatus: typeof publishStatus.Published;
  } = {
    disabled: false,
    syncStatus: videoSyncStatus.Full,
    publishStatus: publishStatus.Published,
  };

  if (tagSlugs && tagSlugs.length > 0) {
    conditions["tags"] = { some: { tag: { slug: { in: tagSlugs } } } };
  }

  const lastCondition = lastVideoId
    ? (await getLastVideo(lastVideoId))?.[by ?? "publishedAt"]
    : null;

  if (lastCondition) {
    if (order === "asc") {
      conditions[by ?? "publishedAt"] = { gt: lastCondition };
    } else {
      conditions[by ?? "publishedAt"] = { lt: lastCondition };
    }
  }

  if (durations) {
    const minMaxPairs =
      getMinxMaxForTimeFilter(durations)?.map((pair) => {
        return { gte: pair[0], lte: pair[1] };
      }) ?? [];
    if (minMaxPairs.length > 0) {
      conditions["OR"] = [];
      minMaxPairs.forEach((pair) => {
        conditions.OR?.push({ duration: pair });
      });
    }
  }

  if (timeframe) {
    const earliestDate = getDateRangeForTimeframe(timeframe);
    if (earliestDate) {
      conditions["publishedAt"] = {
        ...conditions["publishedAt"],
        gte: earliestDate,
      };
    }
  }

  return await prisma.$transaction([
    prisma.video.findMany({
      select: {
        id: true,
        youtubeId: true,
        largeThumbnailUrl: true,
        title: true,
        publishedAt: true,
        views: true,
        duration: true,
        channel: {
          select: {
            id: true,
            title: true,
            smallThumbnailUrl: true,
            youtubeId: true,
          },
        },
        tags: {
          select: { tag: { select: { id: true, slug: true, name: true } } },
        },
      },
      where: conditions,
      take: take ?? 25,
      // include: { channel: true, tags: { include: { tag: true } } },
      orderBy: {
        [by ?? "publishedAt"]: order ?? "desc",
      },
    }),
    prisma.video.count({
      where: conditions,
    }),
  ]);
};

const getLastVideo = async (lastVideoId: LastVideoIdType) => {
  return await prisma.video.findUnique({
    where: { id: lastVideoId },
    select: { publishedAt: true, views: true, likes: true },
  });
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
