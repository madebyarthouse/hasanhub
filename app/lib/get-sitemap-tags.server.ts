import { isNotNull } from "drizzle-orm";
import { Tag } from "../../db/schema";
import type { ReturnTypeOrDb } from "../../db/queries/types";
import {
  createDbCacheKey,
  getCachedQuery,
  type DbCachePolicy,
} from "~/lib/db-cache.server";

const getSitemapTagSlugsFresh = async (db: ReturnTypeOrDb) => {
  const rows = await db.select({ slug: Tag.slug }).from(Tag).where(isNotNull(Tag.slug));

  return rows
    .map((row) => row.slug)
    .filter((slug): slug is string => slug !== null);
};

export const getSitemapTagSlugs = async (
  db: ReturnTypeOrDb,
  cachePolicy?: DbCachePolicy
) => {
  if (!cachePolicy?.ttl) {
    return getSitemapTagSlugsFresh(db);
  }

  return getCachedQuery({
    key: createDbCacheKey("getSitemapTagSlugs", {}),
    cachePolicy,
    getFreshValue: () => getSitemapTagSlugsFresh(db),
  });
};
