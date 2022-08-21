import useUrlState from "~/hooks/useUrlState";
import type { DurationType } from "~/utils/validators";
import type { OrderByType, OrderDirectionType } from "../utils/validators";

const useActionUrl = () => {
  const current = useUrlState();

  const constructUrl = (
    action: {
      tagSlugs?: string[];
      durations?: DurationType[];
      ordering?: { by?: OrderByType; order?: OrderDirectionType };
      lastVideoId?: number;
    },
    index = false
  ) => {
    let merged = {
      ...current,
      ...action,
    };
    merged.tagSlugs = merged?.tagSlugs?.filter(Boolean);
    merged.durations = merged?.durations?.filter(Boolean);

    const basePath =
      merged.tagSlugs.length > 0
        ? `/tags/${merged.tagSlugs.join("/")}?`
        : index
        ? "?index&"
        : "/?";

    const searchParams = new URLSearchParams();

    merged.durations?.forEach((duration: DurationType) => {
      searchParams.append("durations", duration);
    });

    if (merged.ordering.order && merged.ordering.order !== "desc") {
      searchParams.append("order", merged.ordering.order);
    }

    if (merged.ordering.by && merged.ordering.by !== "publishedAt") {
      searchParams.append("by", merged.ordering.by);
    }

    if (merged.lastVideoId) {
      searchParams.append("lastVideoId", merged.lastVideoId.toString());
    }

    return `${basePath}${searchParams.toString()}`;
  };

  return { current, constructUrl };
};

export default useActionUrl;
