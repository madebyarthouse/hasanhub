import { sql } from "drizzle-orm";
import type { ReturnTypeOrDb } from "./types";

/** Recompute denormalized Tag.videoCount / Tag.viewsCount from live videos. */
export const refreshTagAggregates = async (db: ReturnTypeOrDb) => {
  // Reuse one grouped result across both lookups instead of rescanning videos per tag.
  await db.run(sql`
    WITH aggregates AS MATERIALIZED (
      SELECT tv.tagId,
        COUNT(*) AS videoCount,
        COALESCE(SUM(v.views), 0) AS viewsCount
      FROM TagVideo tv
      INNER JOIN Video v ON v.id = tv.videoId
      WHERE v.disabled = 0
        AND v.syncStatus = 'Full'
        AND v.publishStatus = 'Published'
      GROUP BY tv.tagId
    )
    UPDATE Tag SET
      videoCount = COALESCE((
        SELECT a.videoCount FROM aggregates a WHERE a.tagId = Tag.id
      ), 0),
      viewsCount = COALESCE((
        SELECT a.viewsCount FROM aggregates a WHERE a.tagId = Tag.id
      ), 0)
  `);
};
