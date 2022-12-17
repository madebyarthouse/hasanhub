import { useLocation, useSearchParams, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";
import type {
  LastVideoIdType,
  DurationListType,
  OrderByType,
  OrderDirectionType,
} from "../utils/validators";
import { UrlParamsSchema, DurationListValidator } from "../utils/validators";

const getTagSlugsFromPathname = (location?: string | null) => {
  if (location === null || location === undefined) {
    return [];
  }

  return location.replace("/tags/", "").split("/").filter(Boolean);
};

type UrlStateType = {
  tagSlugs: string[];
  lastVideoId?: LastVideoIdType;
  durations?: DurationListType;
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
    ordering: {
      order: "desc",
      by: "publishedAt",
    },
  });

  const transition = useTransition();

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(transition.location?.search);
    const tagSlugs = getTagSlugsFromPathname(location?.pathname);
    const nextTagSlugs = getTagSlugsFromPathname(
      transition?.location?.pathname
    );

    const { order, durations, by } = UrlParamsSchema.parse({
      order: searchParams.get("order") ?? undefined,
      durations: searchParams.getAll("durations"),
      by: searchParams.get("by") ?? undefined,
    });

    const {
      order: nextOrder,
      durations: nextDurations,
      by: nextBy,
    } = UrlParamsSchema.parse({
      order: nextSearchParams.get("order") ?? undefined,
      durations: nextSearchParams.getAll("durations"),
      by: nextSearchParams.get("by") ?? undefined,
    });

    setUrlState({
      durations: nextDurations?.length !== 0 ? nextDurations : durations,
      ordering: {
        order: nextOrder ?? order ?? "desc",
        by: nextBy ?? by ?? "publishedAt",
      },
      tagSlugs: nextTagSlugs.length !== 0 ? nextTagSlugs : tagSlugs,
    });
  }, [location, transition.location, searchParams]);

  return {
    isLoading: transition.state === "loading",
    ...urlState,
  };
};

export default useUrlState;
