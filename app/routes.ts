import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/__videos.tsx", [
    index("routes/__videos/index.tsx"),
    route("tags/*", "routes/__videos/tags/$splat.tsx"),
  ]),
  route("stats", "routes/stats.tsx"),
  route("stats/js/script.js", "routes/stats/js/script.js.ts"),
  route("stats/api/event", "routes/stats/api/event.ts"),
  route("robots.txt", "routes/robots.txt.ts"),
  route("sitemap.xml", "routes/sitemap.xml.ts"),
  route("api/get-tags-for-sidebar", "routes/api/get-tags-for-sidebar.ts"),
  route("api/get-stream-info", "routes/api/get-stream-info.ts"),
  route("api/add-top-of-the-hour-rating", "routes/api/add-top-of-the-hour-rating.ts"),
  route("api/twitch-auth", "routes/api/twitch-auth.ts"),
] satisfies RouteConfig;
