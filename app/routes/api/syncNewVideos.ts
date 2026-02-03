import { decode } from "html-entities";
import { eq, inArray } from "drizzle-orm";
import { getChannel } from "~/sync/clients/youtube-rss.server";
import { publishStatus } from "~/utils/dbEnums";
import { toIsoStringOrNull } from "~/utils/date";
import { Channel, Video } from "../../../db/schema";
import { db } from "../../../db/client";
import type { Route } from "./+types/syncNewVideos";

export const loader = async (_args: Route.LoaderArgs) => {
  const errors: unknown[] = [];

  try {
    const [channels, videos] = await Promise.all([
      db
        .select({ id: Channel.id, youtubeId: Channel.youtubeId, title: Channel.title })
        .from(Channel)
        .where(eq(Channel.publishStatus, publishStatus.Published)),
      db.select({ id: Video.id, youtubeId: Video.youtubeId }).from(Video),
    ]);

    const videosYoutubeIds = videos.map((video) => video.youtubeId);

    const meta = await Promise.all([
      ...channels.map(async (channel) => {
        try {
          const channelResponse = await getChannel(channel.youtubeId);
          const newItems = channelResponse.items.filter(
            (item) => !videosYoutubeIds.includes(item.id)
          );

          console.log("syncNewVideos:fetched", {
            channelId: channel.youtubeId,
            channelTitle: channel.title,
            fetchedCount: channelResponse.items.length,
            newCount: newItems.length,
            sample: newItems.slice(0, 20).map((item) => ({
              id: item.id,
              title: item.title,
              pubDate: toIsoStringOrNull(item.pubDate),
            })),
            truncated: newItems.length > 20,
          });

          if (newItems.length > 0) {
            await db
              .insert(Video)
              .values(
                newItems.map((video) => ({
                  title: decode(video.title),
                  youtubeId: video.id,
                  publishedAt: toIsoStringOrNull(video.pubDate),
                  channelId: channel.id,
                  createdAt: new Date().toISOString(),
                }))
              )
              .onConflictDoNothing();
          }

          const inserted = newItems.length
            ? await db
                .select({
                  id: Video.id,
                  title: Video.title,
                  youtubeId: Video.youtubeId,
                })
                .from(Video)
                .where(inArray(Video.youtubeId, newItems.map((item) => item.id)))
            : [];

          if (inserted.length > 0) {
            console.log("syncNewVideos:inserted", {
              channelId: channel.youtubeId,
              channelTitle: channel.title,
              insertedCount: inserted.length,
              sample: inserted.slice(0, 20).map((video) => ({
                id: video.id,
                title: video.title,
                youtubeId: video.youtubeId,
              })),
              truncated: inserted.length > 20,
            });
          }

          return { channel: { title: channel.title }, videos: inserted };
        } catch (error) {
          console.warn("syncNewVideos:error", {
            channelId: channel.youtubeId,
            error: String(error),
          });
          errors.push(error);
          return null;
        }
      }),
    ]);

    return new Response(
      JSON.stringify(
        meta
          .filter((info) => info !== null)
          .map((info) => {
            return {
              title: info?.channel.title,
              synced: info?.videos.length,
              items: info?.videos.map((video) => video.title),
            };
          })
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error, fetchErrors: errors }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
