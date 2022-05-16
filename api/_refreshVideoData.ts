import { decode } from "html-entities";
import { parse, toSeconds } from "iso8601-duration";
import type { Video } from "@prisma/client";
import type { ExtendendYTChannelSnippet } from "./_youtube.server";
import { getVideoDetails } from "./_youtube.server";
import { prisma } from "./_prisma.server";

const ytVideoExtendedDTO = (ytData: ExtendendYTChannelSnippet) => {
  const duration = toSeconds(parse(ytData?.contentDetails?.duration));
  const views = parseInt(ytData?.statistics?.viewCount);
  const likes = parseInt(ytData?.statistics?.likeCount);
  const comments = parseInt(ytData?.statistics?.commentCount);
  const favorites = parseInt(ytData?.statistics?.favoriteCount);
  console.log(typeof comments === "number", comments);
  return {
    title: decode(ytData?.snippet?.title),
    description: ytData?.snippet?.description,
    publishedAt: new Date(ytData?.snippet?.publishedAt),
    smallThumbnailUrl: ytData?.snippet?.thumbnails?.default?.url,
    mediumThumbnailUrl: ytData?.snippet?.thumbnails?.medium?.url,
    largeThumbnailUrl: ytData?.snippet?.thumbnails?.high?.url,
    xlThumbnailUrl: ytData?.snippet?.thumbnails?.standard?.url,
    xxlThumbnailUrl: ytData?.snippet?.thumbnails?.maxres?.url,
    ...(!isNaN(duration) ? { duration } : {}),
    ...(!isNaN(views) ? { views } : {}),
    ...(!isNaN(likes) ? { likes } : {}),
    ...(!isNaN(comments) ? { comments } : {}),
    ...(!isNaN(favorites) ? { favorites } : {}),
  };
};

const processVideo = async (video: Video) => {
  const ytVideo = (
    await getVideoDetails({
      part: "contentDetails,snippet,statistics",
      id: video.youtubeId,
    })
  )?.data;

  console.log(JSON.stringify(ytVideo));

  if ("error" in ytVideo) {
    console.log(
      `Error '${ytVideo.error}' while searching video ${video.youtubeId}`,
    );
    return;
  }

  if (!("items" in ytVideo) || ytVideo.items?.length === 0) {
    console.log(
      `Video '${video.title}' with Youtube ID = '${video.youtubeId}' was not found.`,
    );
    return;
  }
console.log(ytVideo.items[0])
  const updated = await prisma.video.update({
    where: { id: video.id },
    data: ytVideoExtendedDTO(ytVideo.items[0]),
  });

  console.log(
    `Video '${updated.title}' with Youtube ID = '${updated.youtubeId}' was updated.`,
  );

  return updated;
};

const refreshVideosData = async (videos: Video[]) => {
  const updated = [];
  for (const video of videos) {
    updated.push(await processVideo(video));
  }

  return updated;
};

export default refreshVideosData;
