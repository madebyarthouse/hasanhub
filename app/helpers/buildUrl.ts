import type { TimeFilterOptions } from "~/components/filters";

export const buildLoadMoreUrl = (
    base: string,
    activeSlugs: string[],
    activeDurationFilter: TimeFilterOptions[],
    lastVideoId: number,
    index: boolean
  ) => {
    const slugParams = activeSlugs.join("/");
    const durationParams = activeDurationFilter
      .map((option) => `duration=${option}`)
      .join("&");
  
    return `${base}${slugParams}?${index ? 'index&' : ''}lastVideoId=${lastVideoId}&${durationParams}`;
  };
