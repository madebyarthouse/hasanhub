import { eq, sql } from "drizzle-orm";
import { Video } from "../../db/schema";
import { publishStatus } from "~/utils/dbEnums";
import type { ReturnTypeOrDb } from "../../db/queries/types";
import {
  createDbCacheKey,
  getCachedQuery,
  type DbCachePolicy,
} from "~/lib/db-cache.server";

export type StatsResponse = {
  stats: { count: number; viewsSum: number | null };
  statsWithoutMain: { count: number; viewsSum: number | null };
};

const getStatsFresh = async (db: ReturnTypeOrDb) => {
  const stats = await db
    .select({
      count: sql<number>`count(*)`,
      viewsSum: sql<number>`sum(${Video.views})`,
    })
    .from(Video)
    .where(eq(Video.publishStatus, publishStatus.Published));

  const statsWithoutMain = await db
    .select({
      count: sql<number>`count(*)`,
      viewsSum: sql<number>`sum(${Video.views})`,
    })
    .from(Video)
    .where(
      sql`${Video.publishStatus} = ${publishStatus.Published} AND ${Video.channelId} = ${224}`
    );

  return {
    stats: stats[0] ?? { count: 0, viewsSum: 0 },
    statsWithoutMain: statsWithoutMain[0] ?? { count: 0, viewsSum: 0 },
  };
};

export const getStats = async (
  db: ReturnTypeOrDb,
  cachePolicy?: DbCachePolicy
): Promise<StatsResponse> => {
  if (!cachePolicy?.ttl) {
    return getStatsFresh(db);
  }

  return getCachedQuery({
    key: createDbCacheKey("getStats", {}),
    cachePolicy,
    getFreshValue: () => getStatsFresh(db),
  });
};
