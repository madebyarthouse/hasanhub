export const loader = () => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Sitemap: https://hasanhub.com/sitemap.xml",
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
