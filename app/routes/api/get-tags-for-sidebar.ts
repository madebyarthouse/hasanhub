import { cacheHeader } from "pretty-cache-header";
import { db } from "../../../db/client";
import { getTagsForSidebar } from "../../../db/queries";
import { deriveDbCachePolicy } from "~/lib/db-cache.server";
import type { Route } from "./+types/get-tags-for-sidebar";

export const loader = async (_args: Route.LoaderArgs) => {
  const TAGS_CACHE_POLICY = {
    sMaxage: "1day",
    staleWhileRevalidate: "1week",
  };

  try {
    const tags = await getTagsForSidebar(
      db,
      deriveDbCachePolicy(TAGS_CACHE_POLICY)
    );
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
