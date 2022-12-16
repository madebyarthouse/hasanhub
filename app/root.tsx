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
import Layout from "./ui/layout";
import styles from "./styles/app.css";
import {
  dehydrate,
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { useDehydratedState } from "use-dehydrated-state";
import { useState } from "react";
import { fetchStreamInfo } from "./queries/fetch-stream-data";
import { getBaseUrl } from "./utils/get-base-url";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "HasanHub",
  viewport: "width=device-width,initial-scale=1",
  description: "The HasanAbi Clips Industrial Complex App",
  keywords: "hasanabi, hasanhub, hasan piker, streamer, youtube, clips, twitch",
  "msapplication-tileColor": "#da532c",
  "theme-color": { content: "#1f1f23", media: "(prefers-color-scheme: dark)" },
  "yandex-verification": "45afda70569d2af8",
});

export function headers() {
  return {
    "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=360",
  };
}

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
  const queryClient = new QueryClient();

  console.log(getBaseUrl());
  await queryClient.prefetchQuery(["streamInfo"], fetchStreamInfo);

  return json(
    { dehydratedState: dehydrate(queryClient) },
    {
      status: 200,
      headers: {
        "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=360",
      },
    }
  );
}

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const dehydratedState = useDehydratedState();

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={dehydratedState}>
        <html lang="en">
          <head>
            <Meta />
            <Links />
          </head>
          <body>
            <Layout>
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
      </Hydrate>
    </QueryClientProvider>
  );
}

export default App;
