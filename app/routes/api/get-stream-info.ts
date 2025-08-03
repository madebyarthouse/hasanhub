import { json } from "@remix-run/node";
import { cacheHeader } from "pretty-cache-header";
import { getStreamInfo } from "~/lib/get-stream-info.server";

export async function loader() {
  try {
    const streamData = await getStreamInfo();
    const [streamInfo, streamSchedule] = streamData;

    // Check if we have meaningful data to cache
    const hasStreamInfo = streamInfo?.data?.length > 0;
    const hasScheduleInfo = streamSchedule?.data?.segments?.length > 0;
    const shouldCache = hasStreamInfo || hasScheduleInfo;

    if (shouldCache) {
      return json(streamData, {
        status: 200,
        headers: {
          "Cache-Control": cacheHeader({
            maxAge: "15minutes",
            sMaxage: "15minutes",
            staleWhileRevalidate: "15minutes",
          }),
        },
      });
    } else {
      // Don't cache when there's no meaningful data
      return json(streamData, {
        status: 200,
        headers: {
          "Cache-Control": cacheHeader({
            noCache: true,
            maxAge: "0s",
            mustRevalidate: true,
          }),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return json(
      { error: "Failed to fetch stream info" },
      {
        status: 500,
        headers: {
          "Cache-Control": cacheHeader({
            noCache: true,
            maxAge: "0s",
          }),
        },
      }
    );
  }
}
