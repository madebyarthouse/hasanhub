import { useLoaderData } from "react-router";
import { cacheHeader } from "pretty-cache-header";
import { sql, eq } from "drizzle-orm";
import { Video, Channel } from "../../db/schema";
import { publishStatus } from "~/utils/dbEnums";
import { db } from "../../db/client";
import type { Route } from "./+types/stats";

export const loader = async (_args: Route.LoaderArgs) => {
  try {
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
        sql`${Video.publishStatus} = ${publishStatus.Published} AND ${
          Video.channelId
        } = ${224}`
      );

    const statsPerMonth = await db.all(
      sql`
        SELECT
          strftime('%Y_%m', v.publishedAt) AS yearWithMonth,
          count(*) AS videos_count,
          sum(v.views) AS views_sum
        FROM Video v
        GROUP BY yearWithMonth
        ORDER BY yearWithMonth DESC
      `
    );

    const statsPerChannel = await db.all(
      sql`
        SELECT
          c.title AS title,
          count(*) AS videos_count,
          sum(v.views) AS views_sum
        FROM Video v JOIN Channel c ON v.channelId = c.id
        GROUP BY c.title
        ORDER BY sum(views) DESC
      `
    );

    return new Response(
      JSON.stringify({
        stats: stats[0],
        statsWithoutMain: statsWithoutMain[0],
        statsPerMonth,
        statsPerChannel,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": cacheHeader({
            maxAge: "1hour",
            sMaxage: "1hour",
            staleWhileRevalidate: "1day",
          }),
        },
      }
    );
  } catch (error) {
    console.error({ error });
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

type LoaderData = Awaited<ReturnType<typeof loader>>;

type LoaderSuccess = {
  stats: { count: number; viewsSum: number | null } | undefined;
  statsWithoutMain: { count: number; viewsSum: number | null } | undefined;
  statsPerMonth: Array<{ yearWithMonth: string; videos_count: number; views_sum: number }>;
  statsPerChannel: Array<{ title: string; videos_count: number; views_sum: number }>;
};

export default function Stats() {
  const data = useLoaderData() as LoaderSuccess | { error: string };

  if ("error" in data) {
    return <div>Error fetching the page</div>;
  }

  const { stats, statsWithoutMain } = data;

  return (
    <div>
      <h1>Stats</h1>
      <div className="flex flex-row items-center justify-around gap-10">
        <div className="text-center flex flex-col gap-3 text-white bg-twitchPurpleLight saturate-50 p-4">
          <h2>Total Videos (all)</h2>
          <p>{stats?.count ?? 0}</p>
        </div>

        <div className="text-center flex flex-col gap-3 text-white bg-twitchPurpleLight saturate-50 p-4">
          <h2>Total Views (all)</h2>
          <p>{((stats?.viewsSum ?? 0) as number) / 1_000_000}</p>
        </div>

        <div className="text-center flex flex-col gap-3 text-white bg-twitchPurpleLight saturate-50 p-4">
          <h2>
            Total Videos (without{" "}
            <a href="https://youtube.com/c/hasanabi">HasanAbi</a>)
          </h2>
          <p>{statsWithoutMain?.count ?? 0}</p>
        </div>

        <div className="text-center flex flex-col gap-3 text-white bg-twitchPurpleLight saturate-50 p-4">
          <h2>
            Total Views (without{" "}
            <a href="https://youtube.com/c/hasanabi">HasanAbi</a>)
          </h2>
          <p>{((statsWithoutMain?.viewsSum ?? 0) as number) / 1_000_000}</p>
        </div>
      </div>
    </div>
  );
}
