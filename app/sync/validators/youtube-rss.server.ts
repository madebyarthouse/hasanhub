import { z } from "zod";

export type YTRSSItemSnippetType = z.infer<typeof YTRSSItemSnippetValidator>;
export const YTRSSItemSnippetValidator = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string().transform((v) => new Date(v)),
  author: z.string(),
  id: z.string().transform((v) => v.replace(/^yt:video:/, "")),
  isoDate: z.string().transform((v) => new Date(v)),
});

export type YTRSSItemListType = z.infer<typeof YTRSSItemListValidator>;
export const YTRSSItemListValidator = z.array(YTRSSItemSnippetValidator);

export const YTRSSChannelResponseValidator = z.object({
  title: z.string(),
  items: YTRSSItemListValidator,
  link: z.string().url(),
  feedUrl: z.string().url(),
});
