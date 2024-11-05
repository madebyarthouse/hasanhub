import { prisma } from "~/utils/prisma.server";
import { json } from "@remix-run/node";
import { getChannel } from "../../sync/clients/youtube-api.server";
import type { YoutubeChannel } from "youtube.ts";
import { debug } from "~/utils/debug.server";
import { publishStatus } from "~/utils/dbEnums";
import { chunkAndMergePromises } from "~/utils";

export async function loader({ params }) {
  try {
    const [channels, playlists] = await Promise.all([
      prisma.channel.findMany(),
      prisma.playlist.findMany(),
    ]);

    debug(`# of Channels to be synced: ${channels.length}`);

    const channelsResponse = await Promise.all(
      channels.map(async (video) => {
        try {
          return await getChannel(video.youtubeId);
        } catch (e) {
          debug(`Video with ID ${video.youtubeId} could not be found.`);
          debug(`Video will be marked as unpublished.`);

          await prisma.channel.update({
            where: { id: video.id },
            data: {
              publishStatus: publishStatus.Unpublished,
            },
          });

          return null;
        }
      })
    );

    const channelsData = channelsResponse.filter(
      (channel) => channel !== null
    ) as YoutubeChannel[];

    debug(`# of Channels found: ${channelsData.length}`);

    const updated = await chunkAndMergePromises(
      channelsData.map((channelData, index) => {
        return prisma.channel.update({
          where: { youtubeId: channelData.id },
          data: {
            title: channelData.snippet.title,
            description: channelData.snippet.description,
            publishedAt: channelData.snippet.publishedAt,
            smallThumbnailUrl: channelData.snippet.thumbnails.default.url,
            mediumThumbnailUrl: channelData.snippet.thumbnails.medium.url,
            largeThumbnailUrl: channelData.snippet.thumbnails.high.url,
            publishStatus: publishStatus.Published,
          },
        });
      }),
      5
    );

    debug(`# of Channels updated: ${updated.length}`);
    return json({ channelsSynced: updated.length });
  } catch (error) {
    return json({ error }, 500);
  } finally {
    prisma.$disconnect();
  }
}
