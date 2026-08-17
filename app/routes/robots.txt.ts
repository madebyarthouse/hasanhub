export const loader = () => {
  const block = `Sitemap: https://hasanhub.com/sitemap.xml
Allow: /$
Allow: /tags/*/$
Disallow: /tags/*/*
Disallow: /*?*lastVideoId=
Disallow: /*?*durations=
Disallow: /*?*timeframe=
Disallow: /*?*order=
Disallow: /*?*by=`;

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
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
