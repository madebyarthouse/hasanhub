import { cacheHeader } from "pretty-cache-header";
import { getStreamInfo } from "~/lib/get-stream-info.server";
import type { Route } from "./+types/get-stream-info";

export const loader = async (_args: Route.LoaderArgs) => {
  try {
    const [streamInfo, streamSchedule] = await getStreamInfo();

    const hasStreamInfo = streamInfo?.data?.length > 0;
    const hasScheduleInfo = streamSchedule?.data?.segments?.length > 0;
    const shouldCache = hasStreamInfo || hasScheduleInfo;

    const headers = shouldCache
      ? cacheHeader({
          maxAge: "15minutes",
          sMaxage: "15minutes",
          staleWhileRevalidate: "15minutes",
        })
      : cacheHeader({
          noCache: true,
          maxAge: "0s",
          mustRevalidate: true,
        });

    return new Response(JSON.stringify({ streamInfo, streamSchedule }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": headers,
      },
    });
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch stream info" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": cacheHeader({
            noCache: true,
            maxAge: "0s",
          }),
        },
      }
    );
  }
};
