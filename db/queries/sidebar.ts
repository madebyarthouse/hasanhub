import { sql } from "drizzle-orm";
import type { ReturnTypeOrDb } from "./types";

export type SidebarTagRow = {
  id: number;
  name: string;
  slug: string | null;
  viewsCount: number;
};

export const getTagsForSidebar = async (db: ReturnTypeOrDb) => {
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
  })) as SidebarTagRow[];
};
