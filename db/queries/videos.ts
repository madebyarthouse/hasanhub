import { desc, eq } from "drizzle-orm";
import { Video } from "../schema";
import type { ReturnTypeOrDb } from "./types";

export const listLatestVideos = (db: ReturnTypeOrDb, limit = 25) => {
  return db
    .select()
    .from(Video)
    .where(eq(Video.publishStatus, "Published"))
    .orderBy(desc(Video.publishedAt))
    .limit(limit);
};
