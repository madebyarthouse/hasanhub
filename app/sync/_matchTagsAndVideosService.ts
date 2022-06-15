import { Tag, Video } from "@prisma/client";

const splitMyString = (str: string, splitLength: number) => {
  let a = str.split(" "), b = [];
  a =
    a.filter(function (e) {
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
      const sanitizedTitle: string = video.title.toLowerCase().replace(
        /[^a-zA-Z0-9]/g,
        " ",
      );

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

export default matchTagsAndVideos;
