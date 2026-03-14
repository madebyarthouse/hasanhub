CREATE TABLE `Channel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`youtubeId` text DEFAULT '' NOT NULL,
	`publishedAt` text,
	`smallThumbnailUrl` text DEFAULT '' NOT NULL,
	`mediumThumbnailUrl` text DEFAULT '' NOT NULL,
	`largeThumbnailUrl` text DEFAULT '' NOT NULL,
	`bannerUrl` text DEFAULT '' NOT NULL,
	`viewCount` integer,
	`subscriberCount` integer,
	`keywords` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`publishStatus` text DEFAULT 'Published' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Channel_youtubeId_idx` ON `Channel` (`youtubeId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Channel_youtubeId_key` ON `Channel` (`youtubeId`);--> statement-breakpoint
CREATE TABLE `Playlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`publishedAt` text,
	`youtubeId` text DEFAULT '' NOT NULL,
	`smallThumbnailUrl` text DEFAULT '' NOT NULL,
	`mediumThumbnailUrl` text DEFAULT '' NOT NULL,
	`largeThumbnailUrl` text DEFAULT '' NOT NULL,
	`xlThumbnailUrl` text DEFAULT '' NOT NULL,
	`xxlThumbnailUrl` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`channelId` integer
);
--> statement-breakpoint
CREATE INDEX `Playlist_channelId_idx` ON `Playlist` (`channelId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Playlist_youtubeId_key` ON `Playlist` (`youtubeId`);--> statement-breakpoint
CREATE TABLE `Tag` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`synonyms` text DEFAULT '' NOT NULL,
	`slug` text,
	`lastedMatchedAt` text
);
--> statement-breakpoint
CREATE INDEX `Tag_slug_idx` ON `Tag` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `Tag_slug_key` ON `Tag` (`slug`);--> statement-breakpoint
CREATE TABLE `TagVideo` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tagId` integer,
	`videoId` integer
);
--> statement-breakpoint
CREATE INDEX `TagVideo_tagId_idx` ON `TagVideo` (`tagId`);--> statement-breakpoint
CREATE INDEX `TagVideo_videoId_idx` ON `TagVideo` (`videoId`);--> statement-breakpoint
CREATE UNIQUE INDEX `TagVideo_tagId_videoId_key` ON `TagVideo` (`tagId`,`videoId`);--> statement-breakpoint
CREATE TABLE `TopOfTheHourRating` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rating` real NOT NULL,
	`streamUuid` text NOT NULL,
	`ratedAt` text NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `TwitchAuth` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accessToken` text NOT NULL,
	`expiresAt` text NOT NULL,
	`tokenType` text DEFAULT 'Bearer' NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text
);
--> statement-breakpoint
CREATE INDEX `TwitchAuth_expiresAt_idx` ON `TwitchAuth` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `Video` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`youtubeId` text DEFAULT '' NOT NULL,
	`duration` integer,
	`views` integer,
	`likes` integer,
	`comments` integer,
	`favorites` integer,
	`title` text DEFAULT '' NOT NULL,
	`publishedAt` text,
	`smallThumbnailUrl` text DEFAULT '',
	`mediumThumbnailUrl` text DEFAULT '',
	`largeThumbnailUrl` text DEFAULT '',
	`xlThumbnailUrl` text DEFAULT '',
	`xxlThumbnailUrl` text DEFAULT '',
	`description` text DEFAULT '' NOT NULL,
	`channelId` integer,
	`playlistId` integer,
	`disabled` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text,
	`syncStatus` text DEFAULT 'Snippet' NOT NULL,
	`publishStatus` text DEFAULT 'Published' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Video_channelId_idx` ON `Video` (`channelId`);--> statement-breakpoint
CREATE INDEX `Video_playlistId_idx` ON `Video` (`playlistId`);--> statement-breakpoint
CREATE INDEX `Video_youtubeId_idx` ON `Video` (`youtubeId`);--> statement-breakpoint
CREATE INDEX `Video_publishedAt_idx` ON `Video` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `Video_syncStatus_idx` ON `Video` (`syncStatus`);--> statement-breakpoint
CREATE INDEX `Video_publishStatus_idx` ON `Video` (`publishStatus`);--> statement-breakpoint
CREATE INDEX `Video_views_idx` ON `Video` (`views`);--> statement-breakpoint
CREATE UNIQUE INDEX `Video_youtubeId_key` ON `Video` (`youtubeId`);