import { z } from "zod";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useTransition } from "@remix-run/react";
import getVideos from "~/lib/getVideos";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/components/VideosGrid";
import { useState } from "react";
import getActiveTagsBySlugs from "../../lib/getActiveTagsBySlugs";
import type { Tag } from "@prisma/client";

const loaderParamsSchema = z.object({
  tagSlug: z.string(),
});

const durationParam = z.enum([
  "all",
  "short",
  "medium",
  "long",
  "extralong",
  null,
]);

export function headers() {
  return {
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
}

export const meta: MetaFunction = ({ data, params }) => {
  const { activeTags }: { activeTags: Tag[] } = data;
  const title = activeTags.map((tag) => tag.name).join(" / ");
  console.log(title);
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
  const duration = url.searchParams.get("duration");
  if (duration) {
    durationParam.parse(duration);
  }

  const [activeTags, [videos, totalVideosCount]] = await Promise.all([
    getActiveTagsBySlugs(slugs),
    getVideos({
      tagSlugs: slugs,
      duration: duration ?? "all",
    }),
  ]);

  await prisma.$disconnect();

  return json({ totalVideosCount, videos, activeTags });
};

export default function TagPage() {
  const { videos, totalVideosCount, activeTags } = useLoaderData<LoaderData>();
  const transition = useTransition();

  const title = activeTags.map((tag) => tag.name).join(" / ");

  const handleLoadMore = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log(e);
  };

  return (
    <VideosGrid
      totalVideosCount={totalVideosCount}
      handleLoadMore={handleLoadMore}
      title={title}
      videos={videos}
      loading={transition.state === "loading"}
    />
  );
}
