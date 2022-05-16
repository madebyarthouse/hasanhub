import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "./_prisma.server";
import matchTagsAndVideos from "./_matchTagsAndVideosService";

export default async function handler(request: VercelRequest, response: VercelResponse) {
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
          data: { videos: { createMany: { data: data, skipDuplicates: true } } },
        });
      }
    }
  } catch (error) {
    responseString.push(error as String);
    prisma.$disconnect();
  }

  prisma.$disconnect();

  response.status(200).json(responseString.join("\n"));
}
