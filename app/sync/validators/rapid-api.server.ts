import { z } from "zod";

export type YTImageDataType = z.infer<typeof YTImageDataValidator>;
const YTImageDataValidator = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

export type YTVideoSnippetType = z.infer<typeof YTVideoSnippetValidator>;
export const YTVideoSnippetValidator = z.object({
  kind: z.literal('"youtube#searchResult"'),
  id: z.object({ kind: z.string(), videoId: z.string() }),
  snippet: z.object({
    publishedAt: z.string(),
    channelId: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({
      default: YTImageDataValidator,
      medium: YTImageDataValidator,
      high: YTImageDataValidator,
    }),
    channelTitle: z.string(),
    liveBroadcastContent: z.string(),
    publishTime: z.string(),
  }),
});

export type YTVideoItemType = z.infer<typeof YTVideoItemValidator>;
export const YTVideoItemValidator = z.object({
  kind: z.literal('"youtube#videoListResponse"'),
  id: z.object({ kind: z.string(), videoId: z.string() }),
  snippet: YTVideoSnippetValidator,
  contentDetails: z.object({ duration: z.string() }),
  statistics: z.object({
    viewCount: z.string(),
    likeCount: z.string(),
    favoriteCount: z.string(),
    commentCount: z.string(),
  }),
});

export type SearchVideosResponseType = z.infer<
  typeof SearchVideosResponseValidator
>;
export const SearchVideosResponseValidator = z.object({
  kind: z.literal("youtube#searchListResponse"),
  nextPageToken: z.string(),
  regionCode: z.string(),
  pageInfo: z.object({
    totalResults: z.number(),
    resultsPerPage: z.number(),
  }),
  items: z.array(YTVideoSnippetValidator),
});

export type YTPlaylistSnippetType = z.infer<typeof YTPlaylistSnippetValidator>;
export const YTPlaylistSnippetValidator = z.object({
  kind: z.string(),
  id: z.string(),
  snippet: z.object({
    channelId: z.string(),
    channelTitle: z.string(),
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    thumbnails: z.object({
      default: YTImageDataValidator,
      medium: YTImageDataValidator,
      high: YTImageDataValidator,
      standard: YTImageDataValidator,
      maxres: YTImageDataValidator,
    }),
  }),
});

export type YTChannelSnippetType = z.infer<typeof YTChannelSnippetValidator>;
export const YTChannelSnippetValidator = z.object({
  kind: z.string(),
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    thumbnails: z.object({
      default: YTImageDataValidator,
      medium: YTImageDataValidator,
      high: YTImageDataValidator,
    }),
  }),
  statistics: z.object({
    viewCount: z.string(),
    subscriberCount: z.string(),
    videoCount: z.string(),
  }),
  brandingSettings: z.object({
    channel: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.string(),
    }),
    image: z.object({ bannerExternalUrl: z.string() }),
  }),
});
