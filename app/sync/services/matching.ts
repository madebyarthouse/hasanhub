import type { Tag, Video } from "@prisma/client";

export const matchTagWithVideos = (tag: Tag, videos: Video[]) => {
  const synonyms = tag.synonyms.split(",");

  return videos.filter((video) => {
    const sanitizedTitle: string = video.title
      .toLowerCase()
      .replace(/[('s)]g/, "")
      .replace(/[^a-zA-Z0-9\s]/g, "");

    return synonyms.some((synonym) => {
      return (
        splitMyString(sanitizedTitle, 1).includes(synonym) ||
        splitMyString(sanitizedTitle, 2).includes(synonym)
      );
    });
  });
};

const splitMyString = (str: string, splitLength: number) => {
  const words = str.split(/\s+/);
  const result = [];

  for (let i = 0; i + splitLength <= words.length; i += 1) {
    result.push(words.slice(i, i + splitLength).join(" "));
  }

  return result;

  //   let a = str.split(" "),
  //     b = [];

  //     a = a.filter(function (e) {
  //     return e.length > 0;
  //   });

  //   while (a.length) b.push(a.splice(0, splitLength).join(" "));
  //   return b;
};
