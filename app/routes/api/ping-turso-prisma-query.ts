import { Tag } from "@prisma/client";
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

    return new Response(JSON.stringify(tags), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
