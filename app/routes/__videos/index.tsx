import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/components/VideosGrid";
import getVideos from "../../lib/getVideos";
import { useEffect, useState } from "react";
import { UrlParamsSchema } from "~/utils/validators";
import { z } from "zod";
import useUrlState from "~/hooks/useUrlState";
import useActionUrl from "~/hooks/useActionUrl";

export function headers() {
  return {
    "Cache-Control":
      "public, max-age=60, s-maxage=60, stale-while-revalidate=360",
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  let lastVideoIdParam = url.searchParams.get("lastVideoId");

  try {
    const { order, durations, by, lastVideoId } = UrlParamsSchema.parse({
      order: url.searchParams.get("order") ?? undefined,
      durations: url.searchParams.getAll("durations"),
      by: url.searchParams.get("by") ?? undefined,
      lastVideoId: lastVideoIdParam ? parseInt(lastVideoIdParam) : undefined,
    });

    const [videos, totalVideosCount] = await getVideos({
      order,
      durations,
      by,
      lastVideoId,
    });

    return json(
      { totalVideosCount, videos },
      {
        status: 200,
        headers: {
          "cache-control":
            "public, max-age=60, s-maxage=60, stale-while-revalidate=360",
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

export default function Index() {
  const { totalVideosCount, videos } = useLoaderData();
  const [liveVideos, setLiveVideos] = useState<typeof videos>(videos);
  const fetcher = useFetcher();
  const { isLoading, ordering } = useUrlState();
  const { constructUrl } = useActionUrl();

  const loaderUrl = (lastVideoId: number) =>
    constructUrl({ lastVideoId: lastVideoId }, true);

  useEffect(() => {
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

  let title;
  if (ordering.by === "publishedAt") {
    if (ordering.order === "desc") {
      title = "Latest";
    } else if (ordering.order === "asc") {
      title = "Oldest";
    }
  } else if (ordering.by === "views") {
    if (ordering.order === "desc") {
      title = "Most Viewed";
    } else if (ordering.order === "asc") {
      title = "Least Viewed";
    }
  } else if (ordering.by === "likes") {
    if (ordering.order === "desc") {
      title = "Most Liked";
    } else if (ordering.order === "asc") {
      title = "Least Liked";
    }
  }

  return (
    <VideosGrid
      totalVideosCount={totalVideosCount}
      handleLoadMore={handleLoadMore}
      title={`${title} videos`}
      videos={liveVideos}
      loading={isLoading}
      loadMoreUrl={loaderUrl}
      loadingMore={fetcher.state === "loading"}
    />
  );
}
