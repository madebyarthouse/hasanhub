import type { LoaderArgs, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import getVideos, { TagSlugsValidator } from "~/lib/get-videos";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/ui/videos-grid";
import { useEffect, useState } from "react";
import type { Tag } from "@prisma/client";
import { UrlParamsSchema } from "~/utils/validators";
import useActionUrl from "~/hooks/use-action-url";
import { hydrate, dehydrate, QueryClient } from "@tanstack/react-query";
import { fetchActiveTags } from "~/queries/fetch-active-tags";
import { debug } from "~/utils/debug.server";
import { fetchVideos } from "~/queries/fetch-videos";

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

  try {
    const { order, durations, by } = UrlParamsSchema.parse({
      order: url.searchParams.get("order") ?? undefined,
      durations: url.searchParams.getAll("durations"),
      by: url.searchParams.get("by") ?? undefined,
    });

    const tagSlugs = TagSlugsValidator.parse(slugs);

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(["activeTags", tagSlugs], () => {
      return tagSlugs ? fetchActiveTags(tagSlugs) : [];
    });

    await queryClient.prefetchInfiniteQuery({
      queryKey: [
        "videos",
        ...(tagSlugs ?? []),
        ...(durations ?? []),
        by,
        order,
      ],
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
        tagSlugs,
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

export default function TagPage() {
  return <VideosGrid />;
}
