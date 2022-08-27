import { prisma } from "~/utils/prisma.server";
const getActiveTagsBySlugs = async (tagSlugs: string[] | undefined) => {
  return tagSlugs
    ? await prisma.tag.findMany({
        where: {
          slug: { in: tagSlugs },
        },
      })
    : [];
};

export default getActiveTagsBySlugs;
