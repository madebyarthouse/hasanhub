import { desc, gt } from "drizzle-orm";
import { Tag } from "../schema";
import type { TagSidebarRecord } from "../types";
import type { ReturnTypeOrDb } from "./types";

export const getTagsForSidebar = async (
  db: ReturnTypeOrDb
): Promise<TagSidebarRecord[]> => {
  return db
    .select({
      id: Tag.id,
      name: Tag.name,
      slug: Tag.slug,
      viewsCount: Tag.viewsCount,
    })
    .from(Tag)
    .where(gt(Tag.videoCount, 0))
    .orderBy(desc(Tag.viewsCount));
};
