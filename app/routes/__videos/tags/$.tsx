import { z } from "zod";
import type { LoaderArgs, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import getVideos, { TagSlugsValidator } from "~/lib/get-videos";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/ui/videos-grid";
import { useEffect, useState } from "react";
import type { Tag } from "@prisma/client";
import { UrlParamsSchema } from "~/utils/validators";
import useUrlState from "~/hooks/use-url-state";
import useActionUrl from "~/hooks/use-action-url";
import {
  hydrate,
  dehydrate,
  QueryClient,
  useQuery,
} from "@tanstack/react-query";
import { fetchActiveTags } from "~/queries/fetch-active-tags";
import { debug } from "~/utils/debug.server";

export function headers() {
  return {
    "Cache-Control": "max-age=120, s-maxage=120, stale-while-revalidate=360",
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return { title: "HasanHub" };

  const { tagSlugs } = data;

  const queryClient = new QueryClient();
  hydrate(queryClient, data.dehydratedState);
  const activeTags = queryClient.getQueryData<Tag[]>(["activeTags", tagSlugs]);

  const title = activeTags?.map((tag) => tag.name).join(" and ");
  return {
    title: `${title} | HasanHub`,
  };
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const slugs = params["*"]?.split("/") ?? [];
  let lastVideoIdParam = url.searchParams.get("lastVideoId");

  try {
    const { order, durations, by, lastVideoId } = UrlParamsSchema.parse({
      order: url.searchParams.get("order") ?? undefined,
      durations: url.searchParams.getAll("durations"),
      by: url.searchParams.get("by") ?? undefined,
      lastVideoId: lastVideoIdParam ? parseInt(lastVideoIdParam) : undefined,
    });

    const tagSlugs = TagSlugsValidator.parse(slugs);

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(["activeTags", tagSlugs], () => {
      return tagSlugs ? fetchActiveTags(tagSlugs) : [];
    });

    const [videos, totalVideosCount] = await getVideos({
      tagSlugs,
      order,
      by,
      durations,
      lastVideoId,
    });

    return json(
      {
        totalVideosCount,
        videos,
        dehydratedState: dehydrate(queryClient),
        tagSlugs,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "max-age=120, s-maxage=120, stale-while-revalidate=360",
        },
      }
    );
  } catch (error) {
    debug(error);

    throw json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

export default function TagPage() {
  const { videos, totalVideosCount, tagSlugs } = useLoaderData<typeof loader>();
  const [liveVideos, setLiveVideos] = useState<typeof videos>(videos);
  const fetcher = useFetcher();
  const { isLoading, ordering } = useUrlState();
  const { constructUrl } = useActionUrl();
  const { data: activeTags } = useQuery(["activeTags", tagSlugs], () => {
    return tagSlugs ? fetchActiveTags(tagSlugs) : [];
  });

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
        ?.map((tag) => tag.name)
        .join(" and ")}`}
      videos={liveVideos}
      loading={isLoading}
      loadMoreUrl={loaderUrl}
      loadingMore={fetcher.state === "loading"}
    />
  );
}
