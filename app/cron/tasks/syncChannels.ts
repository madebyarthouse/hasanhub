import { eq } from "drizzle-orm";
import type { YoutubeChannel } from "~/sync/clients/youtube-api.server";
import { getChannel } from "~/sync/clients/youtube-api.server";
import { publishStatus } from "~/utils/dbEnums";
import { chunkAndMergePromises } from "~/utils";
import { Channel } from "../../../db/schema";
import { db } from "../../../db/client";

export const syncChannels = async () => {
  const channels = await db.select().from(Channel);

  console.log("syncChannels:requested", {
    count: channels.length,
    sample: channels.slice(0, 20).map((channel) => ({
      id: channel.id,
      youtubeId: channel.youtubeId,
      title: channel.title,
    })),
    truncated: channels.length > 20,
  });

  const channelsResponse = await Promise.all(
    channels.map(async (channel) => {
      try {
        return await getChannel(channel.youtubeId);
      } catch (error) {
        console.warn("syncChannels:fetchFailed", {
          youtubeId: channel.youtubeId,
          error: String(error),
        });
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

  console.log("syncChannels:fetched", {
    count: channelsData.length,
    sample: channelsData.slice(0, 20).map((channel) => ({
      id: channel.id,
      title: channel.snippet.title,
      publishedAt: channel.snippet.publishedAt,
    })),
    truncated: channelsData.length > 20,
  });

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

  console.log("syncChannels:updated", {
    count: channelsData.length,
    sample: channelsData.slice(0, 20).map((channel) => channel.id),
    truncated: channelsData.length > 20,
  });

  return { channelsSynced: updated.length };
};
