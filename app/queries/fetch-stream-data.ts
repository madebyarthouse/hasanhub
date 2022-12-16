import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "~/routes/api/service/stream-info";
import { getBaseUrl } from "~/utils/get-base-url";

export const fetchStreamInfo = async () => {
  const response = await fetch(`${getBaseUrl()}/api/service/stream-info`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stream info. ${response.statusText}}`);
  }
  return (await response.json()) as SerializeFrom<typeof loader>;
};
