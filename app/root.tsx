import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import Layout from "./ui/layout";
import styles from "./styles/app.css";
import { getStreamInfo } from "./lib/get-stream-info.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "HasanHub – All clips from Hasanabi streams",
  viewport: "width=device-width,initial-scale=1",
  description:
    "The HasanAbi Clips Industrial Complex App. All clips from 70+ Hasan Piker channels.",
  keywords: "hasanabi, hasanhub, hasan piker, streamer, youtube, clips, twitch",
  "msapplication-tileColor": "#da532c",
  "theme-color": "#7a55b1",
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
  const [streamInfo, schedule] = await getStreamInfo();

  return json(
    {
      streamInfo: streamInfo.data?.length
        ? {
            user_login: streamInfo.data[0].user_login,
            user_name: streamInfo.data[0].user_name,
            title: streamInfo.data[0].title,
          }
        : null,
      schedule: schedule.data?.segments.length
        ? {
            broadcaster_login: schedule.data.broadcaster_login,
            broadcaster_name: schedule.data.broadcaster_name,
            start_time: schedule.data.segments[0].start_time,
            title: schedule.data.segments[0].title,
          }
        : null,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=360",
      },
    }
  );
}

function App() {
  const { streamInfo, schedule } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <meta
          name="keywords"
          content="hasanabi, hasanhub, hasan piker, streamer, youtube, clips, twitch"
        />
        <meta name="og:image" content="https://hasanhub.com/og.png" />
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

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

export default App;
