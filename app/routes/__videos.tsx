import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { cacheHeader } from "pretty-cache-header";
import useUrlState from "~/hooks/use-url-state";
import { TagSlugsValidator } from "~/lib/get-videos";
import { debug } from "~/utils/debug.server";
import type { Tag } from "@prisma/client";
import type { DurationListType, TimeframeType } from "~/utils/validators";
import { getStreamInfo } from "~/lib/get-stream-info.server";
import Sidebar from "~/ui/sidebar";

export type VideosLayoutContext = {
  tags: Tag[];
  tagSlugs: string[];
  durations: DurationListType | undefined;
  timeframe: TimeframeType | undefined;
};

export function headers() {
  return {
    "Cache-Control": cacheHeader({
      sMaxage: "1day",
      staleWhileRevalidate: "1week",
    }),
  };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const slugs = params["*"]?.split("/") ?? [];

  const BASE_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const [tagsResponse, streamInfo] = await Promise.all([
      fetch(`${BASE_URL}/api/get-tags-for-sidebar`),
      getStreamInfo(),
    ]);

    const tagsData = await tagsResponse.json();
    const tagSlugs = TagSlugsValidator.parse(slugs) ?? [];

    return json(
      {
        tags: tagsData ?? [],
        tagSlugs,
        streamInfo,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": cacheHeader({
            maxAge: "3days",
            sMaxage: "1day",
            staleWhileRevalidate: "1week",
          }),
        },
      }
    );
  } catch (e) {
    debug(e);
    return json({ error: e });
  }
};

export default function VideosLayout() {
  const { tags } = useLoaderData<typeof loader>();
  const { durations, timeframe, tagSlugs } = useUrlState();

  const context: VideosLayoutContext = {
    tags,
    tagSlugs,
    durations,
    timeframe,
  };

  return (
    <div className="flex flex-col lg:flex-row relative w-full">
      <div className="w-full hidden lg:block lg:sticky lg:overflow-y-auto lg:max-h-screen  lg:top-0 lg:w-1/4 xl:w-1/5  py-5 px-3 lg:px-0 overflow-x-auto">
        <Sidebar tags={tags} />
      </div>

      <div className="lg:pl-14 w-full lg:w-3/4 xl:w-4/5">
        <Outlet context={context} />
      </div>
    </div>
  );
}
