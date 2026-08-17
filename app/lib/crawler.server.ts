import { isbot } from "isbot";

export const isCrawlerRequest = (request: Request) => {
  const userAgent = request.headers.get("user-agent") ?? "";
  return userAgent.length === 0 || isbot(userAgent);
};
