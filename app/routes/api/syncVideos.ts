import { prisma } from "~/utils/prisma.server";
import { json } from "@remix-run/node";
import { getVideo } from "../../sync/clients/youtubeApi.server";
import { PublishStatus, VideoSyncStatus } from "@prisma/client";
import { parse, toSeconds } from "iso8601-duration";
import type { YoutubeVideo } from "youtube.ts";
import { debug } from "~/utils/debug.server";
import { decode } from "html-entities";

const minute = 1000 * 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;

export async function loader({ params }) {
  try {
    const videos = await prisma.video.findMany({
      where: {
        OR: [
          { syncStatus: VideoSyncStatus.Snippet },
          {
            AND: [
              { publishedAt: { gt: new Date(Date.now() - week) } }, // published in the last week
              { updatedAt: { lt: new Date(Date.now() - day) } }, // but not updated in the last day
            ],
          },
          {
            AND: [
              { publishedAt: { gt: new Date(Date.now() - week * 4) } }, // published in the last 4 weeks
              { updatedAt: { lt: new Date(Date.now() - week) } }, // but not updated in the last week
            ],
          },
          {
            AND: [
              { publishedAt: { gt: new Date(Date.now() - week * 12) } }, // published in the last 12 weeks
              { updatedAt: { lt: new Date(Date.now() - week * 4) } }, // but not updated in the last 4 week
            ],
          },
        ],
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 75,
    });

    debug(`# of Videos to be synced: ${videos.length}`);

    const videosResponse = await Promise.all(
      videos.map(async (video) => {
        try {
          return await getVideo(video.youtubeId);
        } catch (e) {
          debug(`Video with ID ${video.youtubeId} could not be found.`);
          debug(`Video will be marked as unpublished.`);
          debug(e?.message);

          await prisma.video.update({
            where: { id: video.id },
            data: {
              publishStatus: PublishStatus.Unpublished,
            },
          });

          return null;
        }
      })
    );

    const videosData = videosResponse.filter(
      (video) => video !== null
    ) as YoutubeVideo[];

    debug(`# of Videos found: ${videosData.length}`);

    const updated = await prisma.$transaction(
      videosData.map((videoData, index) => {
        return prisma.video.update({
          where: { youtubeId: videoData.id },
          data: {
            title: decode(videoData.snippet.title),
            description: decode(videoData.snippet.description),
            publishedAt: videoData.snippet.publishedAt,
            smallThumbnailUrl: videoData.snippet.thumbnails.default.url,
            mediumThumbnailUrl: videoData.snippet.thumbnails.medium.url,
            largeThumbnailUrl: videoData.snippet.thumbnails.high.url,
            xlThumbnailUrl: videoData.snippet.thumbnails.standard?.url,
            xxlThumbnailUrl: videoData.snippet.thumbnails.maxres?.url,
            comments: parseInt(videoData.statistics.commentCount) ?? null,
            views: parseInt(videoData.statistics.viewCount) ?? null,
            likes: parseInt(videoData.statistics.likeCount) ?? null,
            duration:
              toSeconds(parse(videoData.contentDetails.duration)) ?? null,
            syncStatus: VideoSyncStatus.Full,
            publishStatus: PublishStatus.Published,
          },
        });
      })
    );

    debug(`# of Videos updated: ${updated.length}`);
    return json({
      fetched: videos.length,
      found: videosData.length,
      synced: updated.length,
    });
  } catch (error) {
    return json({ error }, 500);
  } finally {
    prisma.$disconnect();
  }
}
