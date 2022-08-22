import { prisma } from "~/utils/prisma.server";
import { json } from "@remix-run/node";
import { getChannel } from "../../sync/clients/youtubeApi.server";
import { PublishStatus } from "@prisma/client";
import type { YoutubeChannel } from "youtube.ts";

export async function loader({ params }) {
  const [channels, playlists] = await Promise.all([
    prisma.channel.findMany(),
    prisma.playlist.findMany(),
  ]);

  console.log(`# of Channels to be synced: ${channels.length}`);

  const channelsResponse = await Promise.all(
    channels.map(async (video) => {
      try {
        return await getChannel(video.youtubeId);
      } catch (e) {
        console.log(`Video with ID ${video.youtubeId} could not be found.`);
        console.log(`Video will be marked as unpublished.`);

        await prisma.channel.update({
          where: { id: video.id },
          data: {
            publishStatus: PublishStatus.Unpublished,
          },
        });

        return null;
      }
    })
  );

  const channelsData = channelsResponse.filter(
    (channel) => channel !== null
  ) as YoutubeChannel[];

  console.log(`# of Channels found: ${channelsData.length}`);

  const updated = await prisma.$transaction(
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
          publishStatus: PublishStatus.Published,
        },
      });
    })
  );

  console.log(`# of Channels updated: ${updated.length}`);

  prisma.$disconnect();

  return json(updated.map((channel) => channel.title));
}
