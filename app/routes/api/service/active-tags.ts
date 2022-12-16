import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { TagSlugsValidator } from "~/lib/get-videos";
import { prisma } from "~/utils/prisma.server";

const getActiveTagsBySlugs = async (tagSlugs: string[] | undefined) => {
  return tagSlugs
    ? await prisma.tag.findMany({
        where: {
          slug: { in: tagSlugs },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      })
    : [];
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const tagSlugs = TagSlugsValidator.parse(url.searchParams.getAll("tagSlugs"));

  return json(await getActiveTagsBySlugs(tagSlugs), {
    status: 200,
    headers: {
      "Cache-Control": "max-age=120, s-maxage=120, stale-while-revalidate=360",
    },
  });
};
