import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { Tag } from "@prisma/client";
import { prisma } from "~/utils/prisma.server";

export type TagsForSidebar = (Tag & { viewsCount: number })[];
const getTagsForSidebar = async () => {
  return (await prisma.$queryRaw`
      SELECT t.id, t.name, t.slug, sum(v.views) AS view_count
      FROM Tag t
        JOIN TagVideo tv ON tv.tagId = t.id
        JOIN Video v ON tv.videoId = v.id
      GROUP BY t.id
      ORDER BY view_count DESC
    `) as unknown as TagsForSidebar;
};

export const loader = async ({ request, params }: LoaderArgs) => {
  return json(await getTagsForSidebar(), {
    status: 200,
    headers: {
      "Cache-Control": `s-maxage=${60 * 60 * 24}, stale-while-revalidate=${
        60 * 60 * 24 * 7
      }`,
    },
  });
};
