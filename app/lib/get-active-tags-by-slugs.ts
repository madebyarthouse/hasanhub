import { inArray } from "drizzle-orm";
import { Tag } from "../../db/schema";
import type { ReturnTypeOrDb } from "../../db/queries/types";

const getActiveTagsBySlugs = async (
  db: ReturnTypeOrDb,
  tagSlugs: string[] | undefined
) => {
  if (!tagSlugs || tagSlugs.length === 0) {
    return [];
  }

  return db
    .select({
      id: Tag.id,
      name: Tag.name,
      slug: Tag.slug,
      videoCount: Tag.videoCount,
    })
    .from(Tag)
    .where(inArray(Tag.slug, tagSlugs));
};

export default getActiveTagsBySlugs;
