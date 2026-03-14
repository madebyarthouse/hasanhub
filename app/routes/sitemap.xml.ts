import { cacheHeader } from "pretty-cache-header";
import { db } from "../../db/client";
import { deriveDbCachePolicy } from "~/lib/db-cache.server";
import { getSitemapTagSlugs } from "~/lib/get-sitemap-tags.server";
import type { Route } from "./+types/sitemap.xml";

export const loader = async (_args: Route.LoaderArgs) => {
  const SITEMAP_CACHE_POLICY = {
    maxAge: "0s",
    sMaxage: "1day",
  };
  const BASE_URL = "https://hasanhub.com";
  const tags = await getSitemapTagSlugs(
    db,
    deriveDbCachePolicy(SITEMAP_CACHE_POLICY)
  );

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
      "Cache-Control": cacheHeader({
        maxAge: SITEMAP_CACHE_POLICY.maxAge,
        sMaxage: SITEMAP_CACHE_POLICY.sMaxage,
      }),
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
};
