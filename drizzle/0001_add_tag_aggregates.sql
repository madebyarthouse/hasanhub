ALTER TABLE `Tag` ADD `videoCount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `Tag` ADD `viewsCount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE Tag SET
  videoCount = (
    SELECT COUNT(*)
    FROM TagVideo tv
    INNER JOIN Video v ON v.id = tv.videoId
    WHERE tv.tagId = Tag.id
      AND v.disabled = 0
      AND v.syncStatus = 'Full'
      AND v.publishStatus = 'Published'
  ),
  viewsCount = (
    SELECT COALESCE(SUM(v.views), 0)
    FROM TagVideo tv
    INNER JOIN Video v ON v.id = tv.videoId
    WHERE tv.tagId = Tag.id
      AND v.disabled = 0
      AND v.syncStatus = 'Full'
      AND v.publishStatus = 'Published'
  );