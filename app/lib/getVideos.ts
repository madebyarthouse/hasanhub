import { z } from "zod";
import { prisma } from "~/utils/prisma.server";
import type { DurationListType, LastVideoIdType } from "~/utils/validators";
import {
  DurationListValidator,
  LastVideoIdValidator,
  OrderByValdiator,
  OrderDirectionValidator,
} from "~/utils/validators";
import type { PublishStatus, VideoSyncStatus } from "@prisma/client";

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
  lastVideoId: LastVideoIdValidator,
});

const getVideos = async (params: GetVideosArgs) => {
  const { order, durations, by, lastVideoId, tagSlugs, take } =
    GetVideosValidator.parse(params);

  let conditions: {
    tags?: object;
    publishedAt?: object;
    views?: object;
    likes?: object;
    OR?: Array<object>;
    disabled: boolean;
    syncStatus: typeof VideoSyncStatus.Full;
    publishStatus: typeof PublishStatus.Published;
  } = {
    disabled: false,
    syncStatus: "Full",
    publishStatus: "Published",
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

  return await prisma.$transaction([
    prisma.video.findMany({
      select: {
        largeThumbnailUrl: true,
        title: true,
        publishedAt: true,
        views: true,
        channel: { select: { title: true, smallThumbnailUrl: true } },
        tags: { select: { tag: { select: { slug: true, name: true } } } },
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

export default getVideos;
