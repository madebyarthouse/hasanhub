import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "~/routes/api/service/active-tags";
import { getBaseUrl } from "~/utils/get-base-url";

export const fetchActiveTags = async (tagSlugs: Array<string>) => {
  const searchParams = new URLSearchParams();
  tagSlugs.forEach((slug) => searchParams.append("tagSlugs", slug));

  if (tagSlugs.length === 0) {
    return [];
  }

  const response = await fetch(
    `${getBaseUrl()}/api/service/active-tags?` + searchParams
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch active tags: ${response.statusText}`);
  }
  return (await response.json()) as SerializeFrom<typeof loader>;
};
