import Parser from "rss-parser";
import { YTRSSChannelResponseValidator } from "../validators/youtubeRss.server";

const parser = new Parser();

export const videoUrl = (youtubeId: string) =>
  `https://www.youtube.com/watch?v=${youtubeId}`;
export const channelUrl = (youtubeId: string) =>
  `https://www.youtube.com/channel/${youtubeId}`;
export const feedUrl = (youtubeId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeId}`;

export const getChannel = async (youtubeId: string) => {
  const rssResponse = await parser.parseURL(feedUrl(youtubeId));
  const channelResponse = YTRSSChannelResponseValidator.parse(rssResponse);

  return {
    channel: {
      title: channelResponse.title,
      link: channelResponse.link,
      feedUrl: channelResponse.feedUrl,
    },
    items: channelResponse.items,
  };
};
