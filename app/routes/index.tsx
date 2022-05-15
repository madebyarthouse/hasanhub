import { json } from "@remix-run/node";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/components/VideosGrid";
import getVideos from "../lib/getVideos";
import { useEffect, useState } from "react";
import { z } from "zod";
import { TimeFilterOptions } from "../lib/getVideos";
import useFilterParams from "~/hooks/useSearchParams";

export function headers() {
  return {
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
}

const durationParam = z.enum(["all", "short", "medium", "long", "extralong"]);
const lastVideoIdParam = z.number();

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const duration = url.searchParams.get("duration");
  const lastVideoId = url.searchParams.get("lastVideoId");

  let getParams: {
    duration?: TimeFilterOptions;
    lastVideoId?: number;
  } = {};

  if (duration) {
    durationParam.parse(duration);
    getParams["duration"] = duration;
  }
  if (lastVideoId) {
    lastVideoIdParam.parse(parseInt(lastVideoId));
    getParams["lastVideoId"] = parseInt(lastVideoId);
  }

  console.log(getParams);
  const [videos, totalVideosCount] = await getVideos(getParams);

  await prisma.$disconnect();

  return json(
    { totalVideosCount, videos },
    { status: 200, headers: { "cache-control": "max-age=300, s-maxage=3600" } }
  );
};

export default function Index() {
  const { totalVideosCount, videos } = useLoaderData();
  console.log(videos);
  const [liveVideos, setLiveVideos] = useState<typeof videos>(videos);
  const fetcher = useFetcher();
  const { transitionState, durationFilter, nextDurationFilter } =
    useFilterParams();

  const loaderUrl = `?index&duration=${
    nextDurationFilter ?? durationFilter
  }&lastVideoId`;

  useEffect(() => {
    console.log("fetcher useEffect", fetcher.data);
    if (fetcher.data && fetcher.data.videos.length > 0) {
      setLiveVideos((prev) => [...prev, ...fetcher.data.videos]);
    }
  }, [fetcher.data]);

  const handleLoadMore = async (lastVideoId: number | null) => {
    console.log("handleLoadMore", lastVideoId);
    fetcher.load(`${loaderUrl}=${lastVideoId}`);
  };

  return (
    <VideosGrid
      totalVideosCount={totalVideosCount}
      handleLoadMore={handleLoadMore}
      title={"Latest Videos"}
      videos={liveVideos}
      loading={transitionState === "loading"}
      loadMoreUrl={loaderUrl}
      loadingMore={fetcher.state === "loading"}
    />
  );
}
