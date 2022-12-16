import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "~/routes/api/service/tags-for-sidebar";
import { getBaseUrl } from "~/utils/get-base-url";

export const fetchTagsForSidebar = async () => {
  const response = await fetch(`${getBaseUrl()}/api/service/tags-for-sidebar`);

  console.log(getBaseUrl());

  if (!response.ok) {
    throw new Error(
      `Failed to fetch tags for sidebar. ${response.statusText}}}`
    );
  }
  return (await response.json()) as SerializeFrom<typeof loader>;
};
