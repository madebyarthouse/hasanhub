import type { GetVideosArgs, loader } from "~/routes/api/service/videos";

export const fetchVideos = async (params: GetVideosArgs) => {
  const response = await fetch(`/api/service/videos`);

  if (!response.ok) {
    throw new Error(`Failed to fetch videos`);
  }
  return (await response.json()) as ReturnType<typeof loader>;
};
