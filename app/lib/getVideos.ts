import { prisma } from "~/utils/prisma.server";

export type TimeFilterOptions = 'all'
  | 'short'
  | 'medium'
  | 'long'
  | 'extralong';

const getLastVideo = async (lastVideoId: number) => {
    return await prisma.video.findUnique({
        where: { id: lastVideoId },
        select: { publishedAt: true },
    });
}

const getMinxMaxForTimeFilter = (durations?: TimeFilterOptions[]) => {
    return durations?.map(duration => {
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
    })
}

type GetVideosArgs = {tagSlugs?: string[]; order?: 'asc' | 'desc'; durations?: TimeFilterOptions[]; lastVideoId?: number; take?: number};

const getVideos = async ({tagSlugs, order, durations, lastVideoId, take}: GetVideosArgs) => {    
    let conditions: {tags?: object, publishedAt?: object, OR?: Array<object>, disabled?: boolean } = {};
    if (tagSlugs) {
        conditions['tags'] = { some: { tag: { slug: { in: tagSlugs } } } };
    }
    
    const lastPublishedAt = lastVideoId ? (await getLastVideo(lastVideoId))?.publishedAt : null;
    if (lastPublishedAt) {
        if (order === 'asc') {
            conditions['publishedAt'] = { gt: lastPublishedAt }
        } else {
            conditions['publishedAt'] = { lt: lastPublishedAt }
        }
    }

    if (durations) {
        const minMaxPairs = getMinxMaxForTimeFilter(durations)?.map((pair) => {return { gte: pair[0], lte: pair[1] }}) ?? [];
        if (minMaxPairs.length > 0) {
          conditions['OR'] = [];
          minMaxPairs.forEach((pair) => {
            conditions.OR?.push({ duration: pair });
          }) 

        }
    }

    conditions['disabled'] = false;
    return await prisma.$transaction([
        prisma.video.findMany({
            where: conditions,
            take: take ?? 25,
            include: { channel: true, tags: { include: { tag: true } } },
            orderBy: { publishedAt: "desc" },
        }),
        prisma.video.count({
            where: conditions,
        })
    ]);
}

export default getVideos;