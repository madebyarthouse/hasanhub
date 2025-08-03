import { cacheHeader } from "pretty-cache-header";

export const loader = async () => {
  const block = `Sitemap: https://hasanhub.com/sitemap.xml
    Allow: /$
    Allow: /tags/*/$
    Disallow: /tags/*/*
    Disallow: /*?*lastVideoId=`;

  const robotText = `
User-agent: Googlebot
${block}

User-agent: Yandex
${block}

User-agent: *
${block}
        `;
  // return the text content, a status 200 success response, and set the content type to text/plain
  return new Response(robotText, {
    status: 200,
    headers: {
      "Cache-Control": cacheHeader({
        maxAge: "0s",
        sMaxage: "1day",
      }),
      "Content-Type": "text/plain",
    },
  });
};
