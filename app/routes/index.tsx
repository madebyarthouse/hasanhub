import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/components/VideosGrid";
import getVideos from "../lib/getVideos";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { TimeFilterOptions } from "../lib/getVideos";
import useFilterParams from "~/hooks/useSearchParams";
import { buildLoadMoreUrl } from "~/helpers/buildUrl";

export function headers() {
  return {
    "Cache-Control": "max-age=360, s-maxage=360, stale-while-revalidate",
  };
}

const durationParams = z.array(
  z.enum(["short", "medium", "long", "extralong"])
);
const lastVideoIdParam = z.number();

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const duration = url.searchParams.getAll(
    "duration"
  ) as unknown as TimeFilterOptions[];
  const lastVideoId = url.searchParams.get("lastVideoId");

  let getParams: {
    durations?: TimeFilterOptions[];
    lastVideoId?: number;
  } = {};

  if (duration) {
    durationParams.parse(duration);
    getParams["durations"] = duration;
  }
  if (lastVideoId) {
    lastVideoIdParam.parse(parseInt(lastVideoId));
    getParams["lastVideoId"] = parseInt(lastVideoId);
  }

  const [videos, totalVideosCount] = await getVideos(getParams);

  await prisma.$disconnect();

  return json(
    { totalVideosCount, videos },
    {
      status: 200,
      headers: {
        "cache-control": "max-age=360, s-maxage=360, stale-while-revalidate",
      },
    }
  );
};

export default function Index() {
  const { totalVideosCount, videos } = useLoaderData();
  const [liveVideos, setLiveVideos] = useState<typeof videos>(videos);
  const fetcher = useFetcher();
  const { transitionState, durationFilter, nextDurationFilter } =
    useFilterParams();

  const loaderUrl = (lastVideoId: number) => {
    return buildLoadMoreUrl(
      `/`,
      [],
      nextDurationFilter?.length > 0 ? nextDurationFilter : durationFilter,
      lastVideoId,
      true
    );
  };

  useEffect(() => {
    console.log(fetcher.data);
    if (fetcher.data && fetcher.data.videos?.length > 0) {
      setLiveVideos((prev) => [...prev, ...fetcher.data.videos]);
    }
  }, [fetcher.data]);

  useEffect(() => {
    setLiveVideos(videos);
  }, [videos]);

  const handleLoadMore = async (lastVideoId: number) => {
    fetcher.load(loaderUrl(lastVideoId));
  };

  console.log("index videos", videos, liveVideos);

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
