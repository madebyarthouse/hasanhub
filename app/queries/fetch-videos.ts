import type { GetVideosArgs, loader } from "~/routes/api/service/videos";
import { getBaseUrl } from "~/utils/get-base-url";

export const fetchVideos = async (params: GetVideosArgs) => {
  const searchParams = new URLSearchParams();
  params.tagSlugs?.forEach((slug) => searchParams.append("tagSlugs", slug));
  params.durations?.forEach((duration) =>
    searchParams.append("durations", duration)
  );
  params.order && searchParams.append("by", params.order);
  params.by && searchParams.append("by", params.by);
  params.take && searchParams.append("take", params.take.toString());
  params.lastVideoId &&
    searchParams.append("lastVideoId", params.lastVideoId.toString());

  const response = await fetch(
    `${getBaseUrl()}/api/service/videos?` + searchParams
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch videos`);
  }
  return (await response.json()) as ReturnType<typeof loader>;
};
