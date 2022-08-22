import { prisma } from "~/utils/prisma.server";
import type { Tag, Video } from "@prisma/client";

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

const splitMyString = (str: string, splitLength: number) => {
  let a = str.split(" "),
    b = [];
  a = a.filter(function (e) {
    return e.length > 0;
  });
  while (a.length) b.push(a.splice(0, splitLength).join(" "));
  return b;
};

const matchTagsAndVideos = (tags: Tag[], videos: Video[]) => {
  let tagVideoIds: { [id: number]: { videoId: number }[] } = {};

  for (const tag of tags) {
    const synonyms = tag.synonyms.split(",");

    tagVideoIds[tag.id] = [];
    for (const video of videos) {
      const sanitizedTitle: string = video.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, " ");

      for (const synonym of synonyms) {
        if (
          splitMyString(sanitizedTitle, 1).includes(synonym) ||
          splitMyString(sanitizedTitle, 2).includes(synonym) ||
          splitMyString(sanitizedTitle, 3).includes(synonym)
        ) {
          tagVideoIds[tag.id].push({ videoId: video.id });
          break;
        }
      }
    }
  }
  return tagVideoIds;
};
