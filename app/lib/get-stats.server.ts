import { eq, sql } from "drizzle-orm";
import { Video } from "../../db/schema";
import { publishStatus } from "~/utils/dbEnums";
import type { ReturnTypeOrDb } from "../../db/queries/types";

export type StatsResponse = {
  stats: { count: number; viewsSum: number | null };
  statsWithoutMain: { count: number; viewsSum: number | null };
};

export const getStats = async (db: ReturnTypeOrDb): Promise<StatsResponse> => {
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
