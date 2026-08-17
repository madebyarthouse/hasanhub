import { isNotNull } from "drizzle-orm";
import { Tag } from "../../db/schema";
import type { ReturnTypeOrDb } from "../../db/queries/types";

export const getSitemapTagSlugs = async (db: ReturnTypeOrDb) => {
  const rows = await db
    .select({
      slug: Tag.slug,
      lastedMatchedAt: Tag.lastedMatchedAt,
    })
    .from(Tag)
    .where(isNotNull(Tag.slug));

  return rows.filter(
    (row): row is { slug: string; lastedMatchedAt: string | null } =>
      row.slug !== null
  );
};
