import { cacheHeader } from "pretty-cache-header";
import { db } from "../../db/client";
import { getSitemapTagSlugs } from "~/lib/get-sitemap-tags.server";
import type { Route } from "./+types/sitemap.xml";

/** Mirrors former KV TTL (1 day) with SWR. */
const SITEMAP_CACHE_POLICY = {
  public: true,
  sMaxage: "1day",
  staleWhileRevalidate: "1week",
} as const;

export const loader = async (_args: Route.LoaderArgs) => {
  const BASE_URL = "https://hasanhub.com";
  const tags = await getSitemapTagSlugs(db);

  const now = new Date().toISOString();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${BASE_URL}/</loc>
            <lastmod>${now}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
    ${tags
      .map(
        (tag) => `
        <url>
            <loc>${BASE_URL}/tags/${tag}</loc>
            <lastmod>${now}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
            `
      )
      .join("\n")}
    </urlset>
  `;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Cache-Control": cacheHeader(SITEMAP_CACHE_POLICY),
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
};
