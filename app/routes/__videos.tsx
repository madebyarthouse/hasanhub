import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/sidebar";
import useUrlState from "~/hooks/useUrlState";
import { TagSlugsValidator } from "~/lib/getVideos";
import { prisma } from "~/utils/prisma.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const slugs = params["*"]?.split("/") ?? [];

  try {
    const data = await prisma.$queryRaw`
      SELECT t.*, sum(v.views) AS view_count
      FROM Tag t
        JOIN TagVideo tv ON tv.tagId = t.id
        JOIN Video v ON tv.videoId = v.id
      GROUP BY t.id
      ORDER BY view_count DESC
    `;
    const tagSlugs = TagSlugsValidator.parse(slugs);

    return json(
      {
        tags: data,
        tagSlugs,
      },
      {
        status: 200,
        headers: {
          "cache-control": `public, max-age=${60 * 60 * 24}, s-maxage=${
            60 * 60 * 24
          }, stale-while-revalidate=${60 * 60 * 24 * 7}`,
        },
      }
    );
  } catch (e) {
    return json({ error: e });
  }
};

export default function VideosLayout() {
  const { tags } = useLoaderData();
  const { durations, tagSlugs } = useUrlState();
  return (
    <div className="flex flex-col lg:flex-row relative lg:gap-14">
      <Sidebar
        tags={tags}
        activeTagSlugs={tagSlugs}
        durationFilter={durations}
      />

      <Outlet />
    </div>
  );
}
