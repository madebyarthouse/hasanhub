import { cacheHeader } from "pretty-cache-header";
import { db } from "../../../db/client";
import { getTagsForSidebar } from "../../../db/queries";
import type { Route } from "./+types/get-tags-for-sidebar";

/** Mirrors former KV TTL (1 day) with SWR. */
const TAGS_CACHE_POLICY = {
  public: true,
  maxAge: "1day",
  staleWhileRevalidate: "1week",
} as const;

export const loader = async (_args: Route.LoaderArgs) => {
  try {
    const tags = await getTagsForSidebar(db);
    const headers =
      tags.length > 0
        ? cacheHeader(TAGS_CACHE_POLICY)
        : cacheHeader({
            noCache: true,
            maxAge: "0s",
            noStore: true,
            mustRevalidate: true,
          });

    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": headers,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
