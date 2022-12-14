import Youtube from "youtube.ts";

const client = new Youtube(process.env.YOUTUBE_API_KEY);

export const getChannel = async (youtubeId: string) => {
  return client.channels.get(youtubeId);
};

export const getVideo = async (youtubeId: string) => {
  return client.videos.get(`https://www.youtube.com/watch?v=${youtubeId}`);
};

export const getChannelVideos = async (
  youtubeId: string,
  pageToken?: string
) => {
  return client.videos.search({ channelId: youtubeId, pageToken });
};
