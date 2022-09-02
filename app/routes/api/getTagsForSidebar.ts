import type { Tag } from "@prisma/client";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";

type TagsForSidebar = (Tag & { viewsCount: number })[];

export async function loader(): Promise<TagsForSidebar> {
  return json(
    await prisma.$queryRaw`
      SELECT t.*, sum(v.views) AS view_count
      FROM Tag t
        JOIN TagVideo tv ON tv.tagId = t.id
        JOIN Video v ON tv.videoId = v.id
      GROUP BY t.id
      ORDER BY view_count DESC
    `,
    {
      status: 200,
      headers: {
        "cache-control": `s-maxage=${60 * 60 * 24}, stale-while-revalidate=${
          60 * 60 * 24 * 7
        }`,
      },
    }
  ) as unknown as TagsForSidebar;
}
