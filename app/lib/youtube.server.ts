import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

type Params = {
  id?: string;
  playlistId?: string;
  channelId?: string;
  order?: string;
  pageToken?: string;
  maxResults?: number;
  part: string;
  cacheBust?: string;
};

const host = process.env.RAPIDAPI_HOST || "";
const key = process.env.RAPIDAPI_KEY || "";

const buildYoutubeRequest = (params: Params): AxiosRequestConfig => {
  const defaultParams: Params = {
    order: "date",
    maxResults: 50,
    part: "snippet,id",
    cacheBust: "1",
  };

  return {
    method: "get" as Method,
    params: { ...(Object.assign(defaultParams, params)) },
    headers: { "x-rapidapi-host": host, "x-rapidapi-key": key },
  };
};

export type YTVideoItem = {
  kind: "youtube#searchResult";
  id: { kind: string; videoId: string };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: { default: YTImageData; medium: YTImageData; high: YTImageData };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
};

export type SearchVideosResponseType = {
  kind: "youtube#searchListResponse";
  nextPageToken?: string;
  regionCode: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
  items: YTVideoItem[];
};

export const searchVideos = async (params: Params): Promise<
  AxiosResponse<SearchVideosResponseType, any>
> => {
  const requestData = {
    url: "https://youtube-v31.p.rapidapi.com/search",
    ...(buildYoutubeRequest(params)),
  };

  return axios.request(requestData);
};

type YTImageData = { url: string; width: number; height: number };

export type YTChannelSnippet = {
  kind: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: { default: YTImageData; medium: YTImageData; high: YTImageData };
  };
  statistics: { viewCount: string; subscriberCount: string; videoCount: string };
  brandingSettings: {
    channel: { title: string; description: string; keywords: string };
    image: { bannerExternalUrl: string };
  };
};

export const searchChannels = async (params: Params): Promise<
  AxiosResponse<
      | {
        kind: string;
        pageInfo: { totalResults: number; resultsPerPage: number };
        items: YTChannelSnippet[];
      }
      | { error: string },
    any
  >
> => {
  const requestData = {
    url: "https://youtube-v31.p.rapidapi.com/channels",
    ...(buildYoutubeRequest(params)),
  };

  return axios.request(requestData);
};

export type ExtendendYTChannelSnippet = {
  kind: "youtube#videoListResponse";
  id: { kind: string; videoId: string };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: YTImageData;
      medium: YTImageData;
      high: YTImageData;
      standard: YTImageData;
      maxres: YTImageData;
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
  contentDetails: { duration: string };
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
};

export const getVideoDetails = async (params: Params): Promise<
  AxiosResponse<
      | {
        kind: string;
        pageInfo: { totalResults: number; resultsPerPage: number };
        items: ExtendendYTChannelSnippet[];
      }
      | { error: string },
    any
  >
> => {
  const requestData = {
    url: "https://youtube-v31.p.rapidapi.com/videos",
    ...(buildYoutubeRequest(params)),
  };

  return axios.request(requestData);
};

export type YTPlaylistSnippet = {
  kind: string;
  id: string;
  snippet: {
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: YTImageData;
      medium: YTImageData;
      high: YTImageData;
      standard: YTImageData;
      maxres: YTImageData;
    };
  };
};

export const searchPlaylists = async (params: Params): Promise<
  AxiosResponse<
      | {
        kind: "youtube#playlistListResponse";
        pageInfo: { totalResults: number; resultsPerPage: number };
        items: YTPlaylistSnippet[];
      }
      | { error: string },
    any
  >
> => {
  const requestData = {
    url: "https://youtube-v31.p.rapidapi.com/playlists",
    ...(buildYoutubeRequest(params)),
  };

  return axios.request(requestData);
};
