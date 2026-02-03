import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const Channel = sqliteTable(
  "Channel",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull().default(""),
    youtubeId: text("youtubeId").notNull().default(""),
    publishedAt: text("publishedAt"),
    smallThumbnailUrl: text("smallThumbnailUrl").notNull().default(""),
    mediumThumbnailUrl: text("mediumThumbnailUrl").notNull().default(""),
    largeThumbnailUrl: text("largeThumbnailUrl").notNull().default(""),
    bannerUrl: text("bannerUrl").notNull().default(""),
    viewCount: integer("viewCount"),
    subscriberCount: integer("subscriberCount"),
    keywords: text("keywords").notNull().default(""),
    description: text("description").notNull().default(""),
    publishStatus: text("publishStatus").notNull().default("Published"),
  },
  (table) => ({
    youtubeIdIdx: index("Channel_youtubeId_idx").on(table.youtubeId),
    youtubeIdUnique: uniqueIndex("Channel_youtubeId_key").on(table.youtubeId),
  })
);

export const Playlist = sqliteTable(
  "Playlist",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull().default(""),
    publishedAt: text("publishedAt"),
    youtubeId: text("youtubeId").notNull().default(""),
    smallThumbnailUrl: text("smallThumbnailUrl").notNull().default(""),
    mediumThumbnailUrl: text("mediumThumbnailUrl").notNull().default(""),
    largeThumbnailUrl: text("largeThumbnailUrl").notNull().default(""),
    xlThumbnailUrl: text("xlThumbnailUrl").notNull().default(""),
    xxlThumbnailUrl: text("xxlThumbnailUrl").notNull().default(""),
    description: text("description").notNull().default(""),
    channelId: integer("channelId"),
  },
  (table) => ({
    channelIdIdx: index("Playlist_channelId_idx").on(table.channelId),
    youtubeIdUnique: uniqueIndex("Playlist_youtubeId_key").on(table.youtubeId),
  })
);

export const Video = sqliteTable(
  "Video",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    youtubeId: text("youtubeId").notNull().default(""),
    duration: integer("duration"),
    views: integer("views"),
    likes: integer("likes"),
    comments: integer("comments"),
    favorites: integer("favorites"),
    title: text("title").notNull().default(""),
    publishedAt: text("publishedAt"),
    smallThumbnailUrl: text("smallThumbnailUrl").default(""),
    mediumThumbnailUrl: text("mediumThumbnailUrl").default(""),
    largeThumbnailUrl: text("largeThumbnailUrl").default(""),
    xlThumbnailUrl: text("xlThumbnailUrl").default(""),
    xxlThumbnailUrl: text("xxlThumbnailUrl").default(""),
    description: text("description").notNull().default(""),
    channelId: integer("channelId"),
    playlistId: integer("playlistId"),
    disabled: integer("disabled", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updatedAt"),
    syncStatus: text("syncStatus").notNull().default("Snippet"),
    publishStatus: text("publishStatus").notNull().default("Published"),
  },
  (table) => ({
    channelIdIdx: index("Video_channelId_idx").on(table.channelId),
    playlistIdIdx: index("Video_playlistId_idx").on(table.playlistId),
    youtubeIdIdx: index("Video_youtubeId_idx").on(table.youtubeId),
    publishedAtIdx: index("Video_publishedAt_idx").on(table.publishedAt),
    syncStatusIdx: index("Video_syncStatus_idx").on(table.syncStatus),
    publishStatusIdx: index("Video_publishStatus_idx").on(table.publishStatus),
    viewsIdx: index("Video_views_idx").on(table.views),
    youtubeIdUnique: uniqueIndex("Video_youtubeId_key").on(table.youtubeId),
  })
);

export const Tag = sqliteTable(
  "Tag",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().default(""),
    synonyms: text("synonyms").notNull().default(""),
    slug: text("slug"),
    lastedMatchedAt: text("lastedMatchedAt"),
  },
  (table) => ({
    slugIdx: index("Tag_slug_idx").on(table.slug),
    slugUnique: uniqueIndex("Tag_slug_key").on(table.slug),
  })
);

export const TagVideo = sqliteTable(
  "TagVideo",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tagId: integer("tagId"),
    videoId: integer("videoId"),
  },
  (table) => ({
    tagIdIdx: index("TagVideo_tagId_idx").on(table.tagId),
    videoIdIdx: index("TagVideo_videoId_idx").on(table.videoId),
    tagVideoUnique: uniqueIndex("TagVideo_tagId_videoId_key").on(
      table.tagId,
      table.videoId
    ),
  })
);

export const TopOfTheHourRating = sqliteTable("TopOfTheHourRating", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rating: real("rating").notNull(),
  streamUuid: text("streamUuid").notNull(),
  ratedAt: text("ratedAt").notNull(),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
});

export const TwitchAuth = sqliteTable(
  "TwitchAuth",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accessToken: text("accessToken").notNull(),
    expiresAt: text("expiresAt").notNull(),
    tokenType: text("tokenType").notNull().default("Bearer"),
    createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updatedAt"),
  },
  (table) => ({
    expiresAtIdx: index("TwitchAuth_expiresAt_idx").on(table.expiresAt),
  })
);
