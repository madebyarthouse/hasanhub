import { useLoaderData } from "react-router";
import { cacheHeader } from "pretty-cache-header";
import { db } from "../../db/client";
import { getStats } from "~/lib/get-stats.server";
import { deriveDbCachePolicy } from "~/lib/db-cache.server";
import type { Route } from "./+types/stats";

const STATS_CACHE_POLICY = {
  maxAge: "1hour",
  sMaxage: "1hour",
  staleWhileRevalidate: "1day",
};

export const loader = async (_args: Route.LoaderArgs) => {
  try {
    const { stats, statsWithoutMain } = await getStats(
      db,
      deriveDbCachePolicy(STATS_CACHE_POLICY)
    );

    return new Response(
      JSON.stringify({
        stats,
        statsWithoutMain,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": cacheHeader(STATS_CACHE_POLICY),
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

export const headers: Route.HeadersFunction = ({ loaderHeaders }) => {
  const cacheControl = loaderHeaders.get("Cache-Control");
  return cacheControl ? { "Cache-Control": cacheControl } : {};
};

type LoaderSuccess = {
  stats: { count: number; viewsSum: number | null } | undefined;
  statsWithoutMain: { count: number; viewsSum: number | null } | undefined;
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
