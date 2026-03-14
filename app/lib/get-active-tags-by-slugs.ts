import { inArray } from "drizzle-orm";
import { Tag } from "../../db/schema";
import type { ReturnTypeOrDb } from "../../db/queries/types";
import {
  createDbCacheKey,
  getCachedQuery,
  type DbCachePolicy,
} from "~/lib/db-cache.server";

const getActiveTagsBySlugs = async (
  db: ReturnTypeOrDb,
  tagSlugs: string[] | undefined,
  cachePolicy?: DbCachePolicy
) => {
  if (!tagSlugs || tagSlugs.length === 0) {
    return [];
  }

  const getFresh = () =>
    db
      .select({
        id: Tag.id,
        name: Tag.name,
        slug: Tag.slug,
      })
      .from(Tag)
      .where(inArray(Tag.slug, tagSlugs));

  if (!cachePolicy?.ttl) {
    return getFresh();
  }

  const cacheKey = createDbCacheKey("getActiveTagsBySlugs", {
    tagSlugs: [...tagSlugs].sort(),
  });

  return getCachedQuery({
    key: cacheKey,
    cachePolicy,
    getFreshValue: getFresh,
  });
};

export default getActiveTagsBySlugs;
