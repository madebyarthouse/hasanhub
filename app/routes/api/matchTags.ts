import { prisma } from "~/utils/prisma.server";
import matchTagsAndVideos from "~/sync/_matchTagsAndVideosService";

export async function loader({ params }) {
  const responseString: String[] = [];
  try {
    const [tags, videos] = await Promise.all([
      prisma.tag.findMany(),
      prisma.video.findMany(),
    ]);
    const tagVideoData = matchTagsAndVideos(tags, videos);

    for (const [tagId, data] of Object.entries(tagVideoData)) {
      if (data.length > 0) {
        await prisma.tag.update({
          where: { id: parseInt(tagId) },
          data: {
            videos: { createMany: { data: data, skipDuplicates: true } },
          },
        });
      }
    }
  } catch (error) {
    responseString.push(error as String);
    prisma.$disconnect();
  }

  prisma.$disconnect();

  return responseString.join("\n");
}
