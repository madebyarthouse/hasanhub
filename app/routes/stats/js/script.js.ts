const SCRIPT_URL = "https://plausible.io/js/script.outbound-links.js";

export const loader = async () => {
  const response = await fetch(SCRIPT_URL);
  const headers = new Headers(response.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/javascript; charset=utf-8");
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
};
