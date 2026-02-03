import { z } from "zod";
import { cacheHeader } from "pretty-cache-header";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import getVideos from "~/lib/get-videos";
import VideosGrid from "~/ui/videos-grid";
import { UrlParamsSchema } from "~/utils/validators";
import { getOrderingTitle } from "~/utils/get-ordering-title";
import useUrlState from "~/hooks/use-url-state";
import useActionUrl from "~/hooks/use-action-url";
import { db } from "../../../db/client";
import type { Route } from "./+types/index";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const lastVideoIdParam = url.searchParams.get("lastVideoId");

  try {
    const { order, durations, timeframe, by, lastVideoId } =
      UrlParamsSchema.parse({
        order: url.searchParams.get("order") ?? undefined,
        durations: url.searchParams.getAll("durations"),
        timeframe: url.searchParams.get("timeframe"),
        by: url.searchParams.get("by") ?? undefined,
        lastVideoId: lastVideoIdParam ? parseInt(lastVideoIdParam) : undefined,
      });

    const [videos, totalVideosCount] = await getVideos(db, {
      order,
      durations,
      timeframe,
      by,
      lastVideoId,
    });

    return new Response(JSON.stringify({ totalVideosCount, videos }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": cacheHeader({
          maxAge: "10minutes",
          sMaxage: "1hour",
          staleWhileRevalidate: "1day",
        }),
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export default function Index() {
  const { totalVideosCount, videos } = useLoaderData<typeof loader>();
  const [liveVideos, setLiveVideos] = useState<typeof videos>(videos);
  const fetcher = useFetcher();
  const { isLoading, ordering } = useUrlState();
  const { constructUrl } = useActionUrl();

  const loaderUrl = (lastVideoId: number) =>
    constructUrl({ lastVideoId: lastVideoId }, true);

  useEffect(() => {
    if (fetcher.data && fetcher.data.videos?.length > 0) {
      setLiveVideos((prev: typeof videos) => [...prev, ...fetcher.data.videos]);
    }
  }, [fetcher.data]);

  useEffect(() => {
    setLiveVideos(videos);
  }, [videos]);

  const handleLoadMore = async (lastVideoId: number) => {
    fetcher.load(loaderUrl(lastVideoId));
  };

  const title = getOrderingTitle(ordering);

  return (
    <VideosGrid
      totalVideosCount={totalVideosCount}
      handleLoadMore={handleLoadMore}
      title={`${title} videos`}
      videos={liveVideos ?? []}
      loading={isLoading}
      loadMoreUrl={loaderUrl}
      loadingMore={fetcher.state === "loading"}
    />
  );
}
