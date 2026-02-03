const EVENT_URL = "https://plausible.io/api/event";

const buildProxyHeaders = (request: Request) => {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const userAgent = request.headers.get("user-agent");
  const accept = request.headers.get("accept");
  const acceptLanguage = request.headers.get("accept-language");
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");
  const connectingIp = request.headers.get("CF-Connecting-IP");
  const forwardedFor = request.headers.get("X-Forwarded-For");

  if (contentType) headers.set("Content-Type", contentType);
  if (userAgent) headers.set("User-Agent", userAgent);
  if (accept) headers.set("Accept", accept);
  if (acceptLanguage) headers.set("Accept-Language", acceptLanguage);
  if (referer) headers.set("Referer", referer);
  if (origin) headers.set("Origin", origin);
  if (connectingIp) {
    headers.set(
      "X-Forwarded-For",
      forwardedFor ? `${forwardedFor}, ${connectingIp}` : connectingIp
    );
    headers.set("CF-Connecting-IP", connectingIp);
  } else if (forwardedFor) {
    headers.set("X-Forwarded-For", forwardedFor);
  }

  return headers;
};

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const response = await fetch(EVENT_URL, {
    method: "POST",
    headers: buildProxyHeaders(request),
    body: request.body,
  });

  const headers = new Headers(response.headers);
  return new Response(response.body, {
    status: response.status,
    headers,
  });
};

export const loader = () => {
  return new Response("Method Not Allowed", { status: 405 });
};
