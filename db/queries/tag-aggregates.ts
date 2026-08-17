import { sql } from "drizzle-orm";
import type { ReturnTypeOrDb } from "./types";

/** Recompute denormalized Tag.videoCount / Tag.viewsCount from live videos. */
export const refreshTagAggregates = async (db: ReturnTypeOrDb) => {
  await db.run(sql`
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
      )
  `);
};
