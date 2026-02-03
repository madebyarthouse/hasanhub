export const loader = () => {
  const block = `Sitemap: https://hasanhub.com/sitemap.xml
Allow: /$
Allow: /tags/*/$
Disallow: /tags/*/*
Disallow: /*?*lastVideoId=`;

  const body = `
User-agent: Googlebot
${block}

User-agent: Yandex
${block}

User-agent: *
${block}
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Cache-Control": "max-age=0, s-maxage=86400",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
