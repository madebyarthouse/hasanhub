import { sql } from "drizzle-orm";
import type { TagSidebarRecord } from "../types";
import type { ReturnTypeOrDb } from "./types";
import {
  createDbCacheKey,
  getCachedQuery,
  type DbCachePolicy,
} from "~/lib/db-cache.server";

const getTagsForSidebarQuery = async (db: ReturnTypeOrDb) => {
  const rows = await db.all(
    sql`
      SELECT t.id, t.name, t.slug, sum(v.views) AS viewsCount
      FROM Tag t
        JOIN TagVideo tv ON tv.tagId = t.id
        JOIN Video v ON tv.videoId = v.id
      GROUP BY t.id
      ORDER BY viewsCount DESC
    `
  );

  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    slug: row.slug === null ? null : String(row.slug),
    viewsCount: Number(row.viewsCount ?? 0),
  })) as TagSidebarRecord[];
};

export const getTagsForSidebar = async (
  db: ReturnTypeOrDb,
  cachePolicy?: DbCachePolicy
) => {
  if (!cachePolicy?.ttl) {
    return getTagsForSidebarQuery(db);
  }

  const cacheKey = createDbCacheKey("getTagsForSidebar", {});

  return getCachedQuery({
    key: cacheKey,
    cachePolicy,
    getFreshValue: () => getTagsForSidebarQuery(db),
  });
};
