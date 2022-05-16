import { prisma } from "~/utils/prisma.server";

export const loader = async () => {
  const BASE_URL = "http://hasanhub.com";

  const tags = await prisma.tag.findMany();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${BASE_URL}/</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>  
    ${tags.map((tag) => {
      return `
        <url>
            <loc>${BASE_URL}/tags/${tag.slug}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
            `;
    })}
    </urlset>
  `;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
};
