import type { Tag } from "@prisma/client";
import { json } from "@remix-run/node";
import { cacheHeader } from "pretty-cache-header";
import { prisma } from "~/utils/prisma.server";

type TagsForSidebar = (Tag & { viewsCount: number })[];

export async function loader() {
  try {
    const response = (await prisma.$queryRaw`
      SELECT t.id, t.name, t.slug, sum(v.views) AS viewsCount
      FROM Tag t
        JOIN TagVideo tv ON tv.tagId = t.id
        JOIN Video v ON tv.videoId = v.id  
      GROUP BY t.id
      ORDER BY viewsCount DESC
    `) as unknown as TagsForSidebar;

    const tags = response.map((tag) => ({
      ...tag,
      viewsCount: Number(tag.viewsCount),
    }));

    return json(tags, {
      status: 200,
      headers: {
        "Cache-Control":
          tags.length > 0
            ? cacheHeader({
                sMaxage: "1day",
                staleWhileRevalidate: "1week",
              })
            : cacheHeader({
                noCache: true,
                maxAge: "0s",
                noStore: true,
                mustRevalidate: true,
              }),
      },
    });
  } catch (e) {
    console.log(e);
    return json([], {
      status: 500,
    });
  }
}
