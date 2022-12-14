import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/ui/sidebar";
import useUrlState from "~/hooks/use-url-state";
import { TagSlugsValidator } from "~/lib/get-videos";
import { debug } from "~/utils/debug.server";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { fetchTagsForSidebar } from "~/queries/fetch-tags-for-sidebar";

export function headers() {
  return {
    "Cache-Control": `s-maxage=${60 * 60 * 24}, stale-while-revalidate=${
      60 * 60 * 24 * 7
    }`,
  };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["tagsForSidear"], fetchTagsForSidebar);

  return json(
    { dehydratedState: dehydrate(queryClient) },
    {
      status: 200,
      headers: {
        "Cache-Control": `max-age=${60 * 60 * 24 * 3}, s-maxage=${
          60 * 60 * 24
        }, stale-while-revalidate=${60 * 60 * 24 * 7}`,
      },
    }
  );
};

export default function VideosLayout() {
  return (
    <div className="flex flex-col lg:flex-row relative w-full">
      <div className="w-full lg:sticky lg:overflow-y-auto lg:max-h-screen  lg:top-0 lg:w-1/4 xl:w-1/5  py-5 px-3 lg:px-0 overflow-x-auto">
        <Sidebar />
      </div>

      <div className="lg:pl-14 w-full lg:w-3/4 xl:w-4/5">
        <Outlet />
      </div>
    </div>
  );
}
