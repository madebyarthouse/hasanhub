import { env } from "cloudflare:workers";

type YoutubeThumbnail = {
  url: string;
  width?: number;
  height?: number;
};

type YoutubeSnippet = {
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default: YoutubeThumbnail;
    medium: YoutubeThumbnail;
    high: YoutubeThumbnail;
    standard?: YoutubeThumbnail;
    maxres?: YoutubeThumbnail;
  };
};

export type YoutubeChannel = {
  id: string;
  snippet: YoutubeSnippet;
};

export type YoutubeVideo = {
  id: string;
  snippet: YoutubeSnippet;
  contentDetails: {
    duration?: string;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
};

export type YoutubeVideoSearchItem = {
  id: {
    videoId: string;
  };
  snippet: YoutubeSnippet;
};

type YoutubeApiResponse<T> = {
  items: T[];
  nextPageToken?: string;
};

const getApiKey = () => {
  const apiKey = env.YOUTUBE_API_KEY ?? "";
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY must be set");
  }
  return apiKey;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API error (${response.status})`);
  }
  return (await response.json()) as T;
};

export const getChannel = async (youtubeId: string) => {
  const apiKey = getApiKey();
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("id", youtubeId);
  url.searchParams.set("key", apiKey);

  const data = await fetchJson<YoutubeApiResponse<YoutubeChannel>>(url.toString());
  const channel = data.items[0];
  if (!channel) {
    throw new Error("Channel not found");
  }
  return channel;
};

export const getVideo = async (youtubeId: string) => {
  const apiKey = getApiKey();
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("id", youtubeId);
  url.searchParams.set("key", apiKey);

  const data = await fetchJson<YoutubeApiResponse<YoutubeVideo>>(url.toString());
  const video = data.items[0];
  if (!video) {
    throw new Error("Video not found");
  }
  return video;
};

export const getChannelVideos = async (
  youtubeId: string,
  pageToken?: string
) => {
  const apiKey = getApiKey();
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", youtubeId);
  url.searchParams.set("type", "video");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("key", apiKey);
  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }

  return fetchJson<YoutubeApiResponse<YoutubeVideoSearchItem>>(url.toString());
};
