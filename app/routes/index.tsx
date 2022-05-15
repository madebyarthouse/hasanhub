import { useState } from "react";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData, useTransition } from "@remix-run/react";
import type { Tag } from "@prisma/client";
import { prisma } from "~/utils/prisma.server";
import VideosGrid from "~/components/VideosGrid";
import getVideos from "../lib/getVideos";

export function headers() {
  return {
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const [videos, totalVideosCount] = await getVideos({});

  await prisma.$disconnect();

  return json({ totalVideosCount, videos });
};

export default function Index() {
  const { totalVideosCount, videos } = useLoaderData();
  const transition = useTransition();

  const handleLoadMore = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log(e);
  };

  return (
    <VideosGrid
      totalVideosCount={totalVideosCount}
      handleLoadMore={handleLoadMore}
      title={"Latest Videos"}
      videos={videos}
      loading={transition.state === "loading"}
    />
  );
}
