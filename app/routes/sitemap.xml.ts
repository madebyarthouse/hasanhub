import { cacheHeader } from "pretty-cache-header";
import { Tag } from "../../db/schema";
import { db } from "../../db/client";
import type { Route } from "./+types/sitemap.xml";

export const loader = async (_args: Route.LoaderArgs) => {
  const BASE_URL = "https://hasanhub.com";
  const tags = await db.select({ slug: Tag.slug }).from(Tag);

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
      .filter((tag) => tag.slug)
      .map(
        (tag) => `
        <url>
            <loc>${BASE_URL}/tags/${tag.slug}</loc>
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
        maxAge: "0s",
        sMaxage: "1day",
      }),
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
};
