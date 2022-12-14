import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "~/routes/api/service/stream-info";

export const fetchStreamInfo = async () => {
  const response = await fetch(`/api/service/stream-info`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tags for sidebar`);
  }
  return (await response.json()) as SerializeFrom<typeof loader>;
};
