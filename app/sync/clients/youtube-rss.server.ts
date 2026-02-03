import { YTRSSChannelResponseValidator } from "../validators/youtube-rss.server";

export const videoUrl = (youtubeId: string) =>
  `https://www.youtube.com/watch?v=${youtubeId}`;
export const channelUrl = (youtubeId: string) =>
  `https://www.youtube.com/channel/${youtubeId}`;
export const feedUrl = (youtubeId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeId}`;

const getDirectChild = (parent: Element, tag: string) => {
  for (const node of Array.from(parent.children)) {
    if (node.localName === tag) return node;
  }
  return null;
};

const getDirectChildText = (parent: Element, tag: string) =>
  getDirectChild(parent, tag)?.textContent?.trim() ?? "";

const getLinkHref = (parent: Element, rel: string) => {
  const links = Array.from(parent.getElementsByTagName("link"));
  const match = links.find((link) => link.getAttribute("rel") === rel);
  return match?.getAttribute("href") ?? "";
};

export const getChannel = async (youtubeId: string) => {
  const response = await fetch(feedUrl(youtubeId));
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed (${response.status})`);
  }

  const xml = await response.text();
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const feed = doc.getElementsByTagName("feed")[0];
  if (!feed) {
    throw new Error("Invalid RSS feed: missing <feed>");
  }

  const items = Array.from(feed.getElementsByTagName("entry")).map((entry) => {
    const title = getDirectChildText(entry, "title");
    const link = getLinkHref(entry, "alternate");
    const authorEl = getDirectChild(entry, "author");
    const author = authorEl
      ? getDirectChildText(authorEl, "name")
      : getDirectChildText(entry, "author");
    const id = getDirectChildText(entry, "id");
    const published = getDirectChildText(entry, "published");
    const updated = getDirectChildText(entry, "updated");

    return {
      title,
      link,
      pubDate: published || updated,
      author,
      id,
      isoDate: updated || published,
    };
  });

  const channelResponse = YTRSSChannelResponseValidator.parse({
    title: getDirectChildText(feed, "title"),
    link: getLinkHref(feed, "alternate"),
    feedUrl: getLinkHref(feed, "self"),
    items,
  });

  return {
    channel: {
      title: channelResponse.title,
      link: channelResponse.link,
      feedUrl: channelResponse.feedUrl,
    },
    items: channelResponse.items,
  };
};
