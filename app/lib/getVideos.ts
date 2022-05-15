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

const getMinxMaxForTimeFilter = (time?: TimeFilterOptions) => {
    let minSeconds;
    let maxSeconds;
    switch (time) {
      case "all":
        minSeconds = 0;
        maxSeconds = 999999999;
        break;
      case "short":
        minSeconds = 0;
        maxSeconds = 60 * 3;
        break;
      case "medium":
        minSeconds = 60 * 3;
        maxSeconds = 60 * 15;
        break;
      case "long":
        minSeconds = 60 * 15;
        maxSeconds = 60 * 30;
        break;
      case "extralong":
        minSeconds = 60 * 30;
        maxSeconds = 999999999;
        break;
      default:
        minSeconds = 0;
        maxSeconds = 999999999;
        break;
    }

    return [minSeconds, maxSeconds];
}

type GetVideosArgs = {tagSlugs?: string[]; order?: 'asc' | 'desc'; duration?: TimeFilterOptions; lastVideoId?: number; take?: number};

const getVideos = async ({tagSlugs, order, duration, lastVideoId, take}: GetVideosArgs) => {    
    let conditions: {tags?: object, publishedAt?: object, duration?: object, disabled?: boolean } = {};
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

    if (duration) {
        const [minSeconds, maxSeconds] = getMinxMaxForTimeFilter(duration);
        conditions['duration'] = { gte: minSeconds, lte: maxSeconds }
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