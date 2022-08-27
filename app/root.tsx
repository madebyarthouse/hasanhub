import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import Layout from "./components/layout";
import styles from "./styles/app.css";
import { getStreamInfo } from "./lib/getStreamInfo.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "HasanHub",
  viewport: "width=device-width,initial-scale=1",
  description: "The HasanAbi Clips Industrial Complex App",
  keywords: "hasanabi, hasanhub, hasan piker, streamer, youtube, clips, twitch",
  "msapplication-tileColor": "#da532c",
  "theme-color": "#ffffff",
  "yandex-verification": "45afda70569d2af8",
});

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "icon", href: "/favicon.ico" },
    {
      rel: "apple-touch-icon",
      size: "180x180x",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "mask-icon",
      href: "/safari-pinned-tab.svg",
      color: "#5bbad5",
    },
    {
      rel: "manifest",
      href: "site.webmanifest",
    },
    {
      rel: "preconnect",
      href: "	https://i.ytimg.com",
    },
    {
      rel: "dns-prefetch",
      href: "	https://i.ytimg.com",
    },
  ];
}

export async function loader() {
  const [streamInfo, schedule] = await getStreamInfo();

  return json({
    streamInfo,
    schedule,
  });
}

function App() {
  const { streamInfo, schedule } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout streamInfo={streamInfo} streamSchedule={schedule}>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />

        <script
          defer
          src="/stats/js/script.js"
          data-api="/stats/api/event"
          data-domain="hasanhub.com"
        />
      </body>
    </html>
  );
}

export default App;
