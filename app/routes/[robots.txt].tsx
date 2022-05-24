import { prisma } from "~/utils/prisma.server";

export const loader = async () => {
  const tags = await prisma.tag.findMany();
  const slugCombinations = tags
    .map((tag) => {
      return `Allow: /tags/${tag.slug}/`;
    })
    .join("\n");

  const allowAssets = `Allow: /build/*.css
Allow: /build/*.js
Allow: /build>/*.jpg
Allow: /build>/*.jpeg
Allow: /build>/*.png
Allow: /build>/*.gif`;

  const allowPlausible = `Allow: https://www.hasanhub.com/stats/js/script.js`;

  const block = `${slugCombinations}
${allowPlausible}
${allowAssets}`;

  const robotText = `
User-agent: Googlebot
Sitemap: https://hasanhub.com/sitemap.xml
Allow: /$
${block}
Disallow: /

User-agent: Yandex
Sitemap: https://hasanhub.com/sitemap.xml
Allow: /$
${block}
Disallow: /

User-agent: *
Sitemap: https://hasanhub.com/sitemap.xml
Allow: /$
${block}
Disallow: /
        `;
  // return the text content, a status 200 success response, and set the content type to text/plain
  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
