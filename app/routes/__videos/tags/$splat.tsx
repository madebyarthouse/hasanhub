import { z } from "zod";
import { cacheHeader } from "pretty-cache-header";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import getVideos, { TagSlugsValidator } from "~/lib/get-videos";
import getActiveTagsBySlugs from "~/lib/get-active-tags-by-slugs";
import VideosGrid from "~/ui/videos-grid";
import { UrlParamsSchema } from "~/utils/validators";
import useUrlState from "~/hooks/use-url-state";
import useActionUrl from "~/hooks/use-action-url";
import { db } from "../../../../db/client";
import type { Route } from "./+types/$splat";

export const meta = ({ data }: Route.MetaArgs) => {
  const { activeTags } = data as LoaderData;
  if (!activeTags || activeTags.length === 0) {
    return [
      { title: "Not found" },
      { name: "description", content: "Not found" },
    ];
  }

  const title = activeTags.map((tag) => tag.name).join(" and ");
  return [
    { title: `${title} | HasanHub` },
    { name: "description", content: `All Hasanabi clips about ${title}.` },
  ];
};

type GetVideoType = Awaited<ReturnType<typeof getVideos>>;

type LoaderData = {
  videos: GetVideoType[0];
  totalVideosCount: GetVideoType[1];
  tagSlugs: string[];
  activeTags: Awaited<ReturnType<typeof getActiveTagsBySlugs>>;
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const slugs = params["*"]?.split("/") ?? [];
  const lastVideoIdParam = url.searchParams.get("lastVideoId");

  if (slugs.length !== 1) {
    return new Response("Not found", { status: 404, statusText: "Not found" });
  }

  try {
    const { order, durations, timeframe, by, lastVideoId } =
      UrlParamsSchema.parse({
        order: url.searchParams.get("order") ?? undefined,
        durations: url.searchParams.getAll("durations"),
        timeframe: url.searchParams.get("timeframe"),
        by: url.searchParams.get("by") ?? undefined,
        lastVideoId: lastVideoIdParam ? parseInt(lastVideoIdParam) : undefined,
      });

    const tagSlugs = TagSlugsValidator.parse(slugs);

    const [activeTags, [videos, totalVideosCount]] = await Promise.all([
      getActiveTagsBySlugs(db, tagSlugs),
      getVideos(db, {
        tagSlugs,
        order,
        by,
        durations,
        timeframe,
        lastVideoId,
      }),
    ]);

    return new Response(
      JSON.stringify({ totalVideosCount, videos, activeTags, tagSlugs }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": cacheHeader({
            maxAge: "10minutes",
            sMaxage: "1hour",
            staleWhileRevalidate: "1day",
          }),
        },
      }
    );
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

export default function TagPage() {
  const { videos, totalVideosCount, activeTags } =
    useLoaderData<LoaderData>();
  const [liveVideos, setLiveVideos] = useState<typeof videos>(videos);
  const fetcher = useFetcher();
  const { isLoading, ordering } = useUrlState();
  const { constructUrl } = useActionUrl();

  const loaderUrl = (lastVideoId: number) =>
    constructUrl({ lastVideoId: lastVideoId }, true);

  useEffect(() => {
    if (fetcher.data && fetcher.data.videos.length > 0) {
      setLiveVideos((prev) => [...prev, ...fetcher.data.videos]);
    }
  }, [fetcher.data]);

  const handleLoadMore = async (lastVideoId: number) => {
    fetcher.load(loaderUrl(lastVideoId));
  };

  useEffect(() => {
    setLiveVideos(videos);
  }, [videos]);

  let title;
  if (ordering.by === "publishedAt") {
    title = ordering.order === "asc" ? "Oldest" : "Latest";
  } else if (ordering.by === "views") {
    title = ordering.order === "asc" ? "Least viewed" : "Most viewed";
  }

  return (
    <VideosGrid
      totalVideosCount={totalVideosCount}
      handleLoadMore={handleLoadMore}
      title={`${title} videos about ${activeTags
        .map((tag) => tag.name)
        .join(" and ")}`}
      // @ts-expect-error - TODO: fix this in the future
      videos={liveVideos ?? []}
      loading={isLoading}
      loadMoreUrl={loaderUrl}
      loadingMore={fetcher.state === "loading"}
    />
  );
}
