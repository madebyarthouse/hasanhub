import type { GetVideosArgs, loader } from "~/routes/api/service/videos";
import { getBaseUrl } from "~/utils/get-base-url";

export const fetchVideos = async (params: GetVideosArgs) => {
  const response = await fetch(`${getBaseUrl()}/api/service/videos`);

  if (!response.ok) {
    throw new Error(`Failed to fetch videos`);
  }
  return (await response.json()) as ReturnType<typeof loader>;
};
