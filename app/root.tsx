import { Tag } from "@prisma/client";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useEffect } from "react";
import Layout from "./components/layout";
import Sidebar from "./components/sidebar";
import styles from "./styles/app.css";
import { prisma } from "./utils/prisma.server";
import { useTransition } from "@remix-run/react";
import { getStreamInfo } from "./lib/getStreamInfo.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "HasanHub",
  viewport: "width=device-width,initial-scale=1",
  description: "The HasanAbi Clips Industrial Complex App",
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

export const loader: LoaderFunction = async ({ params, request }) => {
  const slugs = params["*"]?.split("/") ?? [];

  const [tags, [streamInfo, schedule]] = await Promise.all([
    prisma.$queryRaw`
      SELECT t.*, sum(v.views) AS view_count
      FROM Tag t
        JOIN TagVideo tv ON tv.tagId = t.id
        JOIN Video v ON tv.videoId = v.id
      GROUP BY t.id
      ORDER BY view_count DESC
    `,
    getStreamInfo(),
  ]);

  console.log(JSON.stringify({ params, request }));

  await prisma.$disconnect();

  return json({
    tags,
    streamInfo,
    schedule,
    slugs,
  });
};

export default function App() {
  const { tags, slugs, streamInfo, schedule } = useLoaderData();
  const activeTags =
    slugs.length > 0 ? tags.filter((tag) => slugs.includes(tag.slug)) : [];
  const [searchParams] = useSearchParams();
  const durationFilter = searchParams.getAll("duration") ?? ["all"];
  const fetcher = useFetcher();
  const transition = useTransition();
  const nextSearchParams = new URLSearchParams(transition.location?.search);
  const nextDuration = nextSearchParams.getAll("duration");

  useEffect(() => {
    if (transition.location) {
      fetcher.load(transition.location.pathname);
    }
  }, [transition.location]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout streamInfo={streamInfo} streamSchedule={schedule}>
          <Sidebar
            tags={tags}
            activeTags={fetcher.data?.activeTags ?? activeTags}
            durationFilter={
              nextDuration.length > 0 ? nextDuration : durationFilter
            }
          />
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
