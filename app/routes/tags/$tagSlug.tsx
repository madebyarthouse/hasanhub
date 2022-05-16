import { z } from "zod";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import getVideos from "~/lib/getVideos";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/components/VideosGrid";
import { useEffect, useState } from "react";
import getActiveTagsBySlugs from "../../lib/getActiveTagsBySlugs";
import type { Tag } from "@prisma/client";
import type { TimeFilterOptions } from "../../lib/getVideos";
import useFilterParams from "~/hooks/useSearchParams";

const loaderParamsSchema = z.object({
  tagSlug: z.string(),
});

const durationParam = z.enum(["all", "short", "medium", "long", "extralong"]);
const lastVideoIdParam = z.number();

export function headers() {
  return {
    "Cache-Control": "max-age=360, s-maxage=360, stale-while-revalidate",
  };
}

export const meta: MetaFunction = ({ data, params }) => {
  const { activeTags }: { activeTags: Tag[] } = data;
  const title = activeTags.map((tag) => tag.name).join(" / ");
  return {
    title: `${title} | HasanHub`,
  };
};

type GetVideoType = Awaited<ReturnType<typeof getVideos>>;

type LoaderData = {
  videos: GetVideoType[0];
  totalVideosCount: GetVideoType[1];
  activeTags: Awaited<ReturnType<typeof getActiveTagsBySlugs>>;
};
export const loader: LoaderFunction = async ({ request, params }) => {
  loaderParamsSchema.parse(params);
  const slugs = params.tagSlug ? [params.tagSlug] : [];
  const url = new URL(request.url);
  console.log(url);
  const duration = url.searchParams.get("duration");
  const lastVideoId = url.searchParams.get("lastVideoId");

  let getParams: {
    tagSlugs: string[];
    duration?: TimeFilterOptions;
    lastVideoId?: number;
  } = { tagSlugs: slugs };

  if (duration) {
    durationParam.parse(duration);
    getParams["duration"] = duration;
  }
  if (lastVideoId) {
    lastVideoIdParam.parse(parseInt(lastVideoId));
    getParams["lastVideoId"] = parseInt(lastVideoId);
  }

  console.log("getParams", getParams);
  const [activeTags, [videos, totalVideosCount]] = await Promise.all([
    getActiveTagsBySlugs(slugs),
    getVideos(getParams),
  ]);

  await prisma.$disconnect();

  return json(
    { totalVideosCount, videos, activeTags },
    {
      status: 200,
      headers: {
        "cache-control": "max-age=360, s-maxage=360, stale-while-revalidate",
      },
    }
  );
};

export default function TagPage() {
  const { videos, totalVideosCount, activeTags } = useLoaderData<LoaderData>();
  console.log(videos);
  const [liveVideos, setLiveVideos] = useState<typeof videos>(videos);
  const fetcher = useFetcher();
  const { transitionState, durationFilter, nextDurationFilter } =
    useFilterParams();

  const slugUrl = activeTags.map((tag) => tag.slug).join("/");
  const title = activeTags.map((tag) => tag.name).join(" / ");

  const loaderUrl = `/tags/${slugUrl}?duration=${
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
      title={title}
      videos={liveVideos}
      loading={transitionState === "loading"}
      loadMoreUrl={loaderUrl}
      loadingMore={fetcher.state === "loading"}
    />
  );
}
