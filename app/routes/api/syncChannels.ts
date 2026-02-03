import { eq } from "drizzle-orm";
import type { YoutubeChannel } from "~/sync/clients/youtube-api.server";
import { getChannel } from "~/sync/clients/youtube-api.server";
import { publishStatus } from "~/utils/dbEnums";
import { chunkAndMergePromises } from "~/utils";
import { Channel, Playlist } from "../../../db/schema";
import { db } from "../../../db/client";
import type { Route } from "./+types/syncChannels";

export const loader = async (_args: Route.LoaderArgs) => {
  try {
    const [channels, playlists] = await Promise.all([
      db.select().from(Channel),
      db.select().from(Playlist),
    ]);
    void playlists;

    const channelsResponse = await Promise.all(
      channels.map(async (channel) => {
        try {
          return await getChannel(channel.youtubeId);
        } catch (error) {
          await db
            .update(Channel)
            .set({ publishStatus: publishStatus.Unpublished })
            .where(eq(Channel.id, channel.id));
          return null;
        }
      })
    );

    const channelsData = channelsResponse.filter(
      (channel) => channel !== null
    ) as YoutubeChannel[];

    const updated = await chunkAndMergePromises(
      channelsData.map((channelData) => {
        return db
          .update(Channel)
          .set({
            title: channelData.snippet.title,
            description: channelData.snippet.description,
            publishedAt: channelData.snippet.publishedAt,
            smallThumbnailUrl: channelData.snippet.thumbnails.default.url,
            mediumThumbnailUrl: channelData.snippet.thumbnails.medium.url,
            largeThumbnailUrl: channelData.snippet.thumbnails.high.url,
            publishStatus: publishStatus.Published,
          })
          .where(eq(Channel.youtubeId, channelData.id));
      }),
      5
    );

    return new Response(JSON.stringify({ channelsSynced: updated.length }), {
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
