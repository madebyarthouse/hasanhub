import { z } from "zod";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { cacheHeader } from "pretty-cache-header";
import getVideos, { TagSlugsValidator } from "~/lib/get-videos";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/ui/videos-grid";
import { useEffect, useState } from "react";
import type { Tag } from "@prisma/client";
import { UrlParamsSchema } from "~/utils/validators";
import useUrlState from "~/hooks/use-url-state";
import useActionUrl from "~/hooks/use-action-url";
import getActiveTagsBySlugs from "~/lib/get-active-tags-by-slugs";

export function headers() {
  return {
    "Cache-Control": cacheHeader({
      maxAge: "1hour",
      sMaxage: "12hours",
      staleWhileRevalidate: "1day",
    }),
  };
}

export const meta: MetaFunction = ({ data, parentsData }) => {
  // const { tags, tagSlugs }: { tags: Tag[]; tagSlugs: string[] } =
  //   parentsData["routes/__videos"];
  const { activeTags } = data as LoaderData;

  if (!activeTags || activeTags.length === 0) {
    return {
      title: "Not found",
      description: "Not found",
    };
  }

  const title = activeTags.map((tag) => tag.name).join(" and ");
  return {
    title: `${title} | HasanHub`,
    description: `All Hasanabi clips about ${title}.`,
  };
};

type GetVideoType = Awaited<ReturnType<typeof getVideos>>;

type LoaderData = {
  videos: GetVideoType[0];
  totalVideosCount: GetVideoType[1];
  tagSlugs: string[];
  activeTags: Tag[];
};
export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const slugs = params["*"]?.split("/") ?? [];
  let lastVideoIdParam = url.searchParams.get("lastVideoId");

  if (slugs.length !== 1) {
    throw new Response("Not found", { status: 404, statusText: "Not found" });
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
      await getActiveTagsBySlugs(tagSlugs),
      getVideos({
        tagSlugs,
        order,
        by,
        durations,
        timeframe,
        lastVideoId,
      }),
    ]);

    return json(
      { totalVideosCount, videos, activeTags, tagSlugs },
      {
        status: 200,
        headers: {
          "Cache-Control": cacheHeader({
            maxAge: "10minutes",
            sMaxage: "1hour",
            staleWhileRevalidate: "1day",
          }),
        },
      }
    );
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return json(error.issues, { status: 500 });
    }
    return json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

export default function TagPage() {
  const { videos, totalVideosCount, activeTags } = useLoaderData<LoaderData>();
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
    if (ordering.order === "desc") {
      title = "Latest";
    } else if (ordering.order === "asc") {
      title = "Oldest";
    }
  } else if (ordering.by === "views") {
    if (ordering.order === "desc") {
      title = "Most viewed";
    } else if (ordering.order === "asc") {
      title = "Least viewed";
    }
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
