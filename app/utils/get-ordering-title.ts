import type { OrderByType, OrderDirectionType } from "~/utils/validators";

type Ordering = {
  by?: OrderByType | null;
  order?: OrderDirectionType | null;
};

export const getOrderingTitle = (ordering: Ordering) => {
  if (ordering.by === "publishedAt") {
    return ordering.order === "asc" ? "Oldest" : "Latest";
  }
  if (ordering.by === "views") {
    return ordering.order === "asc" ? "Least Viewed" : "Most Viewed";
  }
  return "Latest";
};
