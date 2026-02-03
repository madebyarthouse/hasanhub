import { useLocation, useSearchParams, useNavigation } from "react-router";
import { useEffect, useState } from "react";
import type {
  LastVideoIdType,
  DurationListType,
  TimeframeType,
  OrderByType,
  OrderDirectionType,
} from "../utils/validators";
import {
  UrlParamsSchema,
  DurationListValidator,
  TimeframeValidator,
} from "../utils/validators";

const getTagSlugsFromPathname = (location?: string | null) => {
  if (location === null || location === undefined) {
    return [];
  }

  return location.replace("/tags/", "").split("/");
};

type UrlStateType = {
  tagSlugs: string[];
  lastVideoId?: LastVideoIdType;
  durations?: DurationListType;
  timeframe?: TimeframeType;
  ordering: {
    by: OrderByType;
    order: OrderDirectionType;
  };
};

const useUrlState = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [urlState, setUrlState] = useState<UrlStateType>({
    tagSlugs: getTagSlugsFromPathname(location?.pathname),
    durations:
      DurationListValidator.parse(searchParams.getAll("durations")) ?? null,
    timeframe: (() => {
      const timeframeParam = searchParams.get("timeframe");
      return timeframeParam
        ? TimeframeValidator.parse(timeframeParam)
        : undefined;
    })(),
    ordering: {
      order: "desc",
      by: "publishedAt",
    },
  });

  const navigation = useNavigation();

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(navigation.location?.search);

    let lastVideoIdParam = searchParams.get("lastVideoId");
    let nextLastVideoIdParam = nextSearchParams.get("lastVideoId");

    const tagSlugs = getTagSlugsFromPathname(location?.pathname);
    const nextTagSlugs = getTagSlugsFromPathname(navigation.location?.pathname);

    const { order, durations, timeframe, by, lastVideoId } =
      UrlParamsSchema.parse({
        order: searchParams.get("order") ?? undefined,
        durations: searchParams.getAll("durations"),
        timeframe: searchParams.get("timeframe"),
        by: searchParams.get("by") ?? undefined,
        lastVideoId: lastVideoIdParam ? parseInt(lastVideoIdParam) : undefined,
      });

    const {
      order: nextOrder,
      durations: nextDurations,
      timeframe: nextTimeframe,
      by: nextBy,
      lastVideoId: nextLastVideoId,
    } = UrlParamsSchema.parse({
      order: nextSearchParams.get("order") ?? undefined,
      durations: nextSearchParams.getAll("durations"),
      timeframe: nextSearchParams.get("timeframe"),
      by: nextSearchParams.get("by") ?? undefined,
      lastVideoId: nextLastVideoIdParam
        ? parseInt(nextLastVideoIdParam)
        : undefined,
    });

    setUrlState({
      durations: nextDurations?.length !== 0 ? nextDurations : durations,
      timeframe: nextTimeframe ?? timeframe,
      ordering: {
        order: nextOrder ?? order ?? "desc",
        by: nextBy ?? by ?? "publishedAt",
      },
      lastVideoId: nextLastVideoId ?? lastVideoId,
      tagSlugs: nextTagSlugs.length !== 0 ? nextTagSlugs : tagSlugs,
    });
  }, [location, navigation.location, searchParams]);

  return {
    isLoading: navigation.state === "loading",
    ...urlState,
  };
};

export default useUrlState;
