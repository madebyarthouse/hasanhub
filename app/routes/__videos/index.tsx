import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/ui/videos-grid";
import { UrlParamsSchema } from "~/utils/validators";
import { debug } from "~/utils/debug.server";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { fetchVideos } from "~/queries/fetch-videos";

export function headers() {
  return {
    "Cache-Control": "max-age=120, s-maxage=120, stale-while-revalidate=360",
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);

  try {
    const { order, durations, by } = UrlParamsSchema.parse({
      order: url.searchParams.get("order") ?? undefined,
      durations: url.searchParams.getAll("durations"),
      by: url.searchParams.get("by") ?? undefined,
    });

    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery({
      queryKey: ["videos", ...(durations ?? []), by, order],
      queryFn: async ({ pageParam = 0 }) => {
        return fetchVideos({
          durations,
          order: order,
          by: by,
          lastVideoId: pageParam,
        });
      },
    });

    return json(
      {
        dehydratedState: dehydrate(queryClient),
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

export default function Index() {
  return <VideosGrid />;
}
