import { json } from "@remix-run/node";
import { decode } from "html-entities";
import { getChannel } from "~/sync/clients/youtubeRss.server";
import { prisma } from "~/utils/prisma.server";

export async function loader() {
  let errors: any[] = [];
  try {
    const [channels, videos] = await Promise.all([
      prisma.channel.findMany({
        select: { id: true, youtubeId: true, title: true },
      }),
      prisma.video.findMany({
        select: { id: true, youtubeId: true },
      }),
    ]);

    const videosYoutubeIds = videos.map((video) => video.youtubeId);

    const meta = await Promise.all([
      ...channels.map(async (channel) => {
        try {
          const channelResponse = await getChannel(channel.youtubeId);

          const updated = await prisma.$transaction(
            channelResponse.items
              .filter((item) => !videosYoutubeIds.includes(item.id))
              .map((video) =>
                prisma.video.upsert({
                  where: { youtubeId: video.id },
                  update: {},
                  create: {
                    title: decode(video.title),
                    youtubeId: video.id,
                    publishedAt: video.pubDate,
                    channel: { connect: { id: channel.id } },
                  },
                })
              )
          );

          return { channel: { title: channel.title }, videos: updated };
        } catch (error) {
          errors.push(error);
          console.error(error);
          return null;
        }
      }),
    ]);

    return json(
      meta
        .filter((info) => info !== null)
        .map((info) => {
          return {
            title: info?.channel.title,
            synced: info?.videos.length,
            items: info?.videos.map((video) => video.title),
          };
        })
    );
  } catch (e) {
    console.error(e);
    return json({ error: e, fetchErrors: errors }, 500);
  } finally {
    prisma.$disconnect();
  }
}
