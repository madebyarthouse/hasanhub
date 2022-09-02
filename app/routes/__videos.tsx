import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/sidebar";
import useUrlState from "~/hooks/useUrlState";
import { TagSlugsValidator } from "~/lib/getVideos";
import { debug } from "~/utils/debug.server";
import { prisma } from "~/utils/prisma.server";

export function headers() {
  return {
    "Cache-Control": `s-maxage=${60 * 60 * 24}, stale-while-revalidate=${
      60 * 60 * 24 * 7
    }`,
  };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const slugs = params["*"]?.split("/") ?? [];

  try {
    const response = await fetch(`${url.origin}/api/getTagsForSidebar`);
    const data = await response.json();

    const tagSlugs = TagSlugsValidator.parse(slugs);

    return json(
      {
        tags: data,
        tagSlugs,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": `max-age=${60 * 60 * 24 * 3}, s-maxage=${
            60 * 60 * 24
          }, stale-while-revalidate=${60 * 60 * 24 * 7}`,
        },
      }
    );
  } catch (e) {
    debug(e);
    return json({ error: e });
  }
};

export default function VideosLayout() {
  const { tags } = useLoaderData();
  const { durations, tagSlugs } = useUrlState();
  return (
    <div className="flex flex-col lg:flex-row relative w-full">
      <div className="w-full lg:sticky lg:overflow-y-auto lg:max-h-screen  lg:top-0 lg:w-1/4 xl:w-1/5  py-5 px-3 lg:px-0 overflow-x-auto">
        <Sidebar
          tags={tags}
          activeTagSlugs={tagSlugs}
          durationFilter={durations}
        />
      </div>

      <div className="lg:pl-14 w-full lg:w-3/4 xl:w-4/5">
        <Outlet />
      </div>
    </div>
  );
}
