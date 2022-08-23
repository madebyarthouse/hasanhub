import type { Tag, Video } from "@prisma/client";

export const matchTagWithVideos = (tag: Tag, videos: Video[]) => {
  return videos.filter((video) => {
    const sanitizedTitle: string = video.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, " ");

    const synonyms = tag.synonyms.split(",");

    return synonyms.some((synonym) => {
      return (
        splitMyString(sanitizedTitle, 1).includes(synonym) ||
        splitMyString(sanitizedTitle, 2).includes(synonym) ||
        splitMyString(sanitizedTitle, 3).includes(synonym)
      );
    });
  });
};

const splitMyString = (str: string, splitLength: number) => {
  let a = str.split(" "),
    b = [];
  a = a.filter(function (e) {
    return e.length > 0;
  });
  while (a.length) b.push(a.splice(0, splitLength).join(" "));
  return b;
};
