import type { DurationListType } from "~/utils/validators";

export const buildLoadMoreUrl = (
  base: string,
  activeSlugs: string[],
  activeDurationFilter: DurationListType,
  lastVideoId: number,
  index: boolean
) => {
  const slugParams = activeSlugs.join("/");
  const durationParams = activeDurationFilter
    .map((option) => `duration=${option}`)
    .join("&");

  return `${base}${slugParams}?${
    index ? "index&" : ""
  }lastVideoId=${lastVideoId}&${durationParams}`;
};
