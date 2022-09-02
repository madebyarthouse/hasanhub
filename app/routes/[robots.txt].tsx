export const loader = async () => {
  const block = `Sitemap: https://hasanhub.com/sitemap.xml
Allow: /$
Allow: /tags/*/$
Disallow: /tags/*/*`;

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
      "Cache-Control": "max-age=0, s-maxage=86400",
      "Content-Type": "text/plain",
    },
  });
};
