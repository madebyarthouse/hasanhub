import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "~/routes/api/service/active-tags";
import { getBaseUrl } from "~/utils/get-base-url";

export const fetchActiveTags = async () => {
  const response = await fetch(`${getBaseUrl()}/api/service/active-tags`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tags for sidebar`);
  }
  return (await response.json()) as SerializeFrom<typeof loader>;
};
