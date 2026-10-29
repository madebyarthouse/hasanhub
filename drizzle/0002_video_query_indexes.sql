CREATE INDEX `Video_visible_publishedAt_idx` ON `Video` (`disabled`,`syncStatus`,`publishStatus`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `Video_visible_views_idx` ON `Video` (`disabled`,`syncStatus`,`publishStatus`,`views`);--> statement-breakpoint
CREATE INDEX `Video_createdAt_idx` ON `Video` (`createdAt`);