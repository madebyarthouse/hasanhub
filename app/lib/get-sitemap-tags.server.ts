import { isNotNull } from "drizzle-orm";
import { Tag } from "../../db/schema";
import type { ReturnTypeOrDb } from "../../db/queries/types";

export const getSitemapTagSlugs = async (db: ReturnTypeOrDb) => {
  const rows = await db.select({ slug: Tag.slug }).from(Tag).where(isNotNull(Tag.slug));

  return rows
    .map((row) => row.slug)
    .filter((slug): slug is string => slug !== null);
};
