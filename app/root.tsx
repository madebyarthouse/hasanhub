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
import { useEffect, useState } from "react";
import type { TimeFilterOptions } from "./components/filters";
import Layout from "./components/layout";
import Sidebar from "./components/sidebar";
import styles from "./styles/app.css";
import { prisma } from "./utils/prisma.server";
import { useTransition } from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "HasanHub",
  viewport: "width=device-width,initial-scale=1",
  description: "The HasanAbi Clips Industrial Complex App",
  "msapplication-tileColor": "#da532c",
  "theme-color": "#ffffff",
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
  ];
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const slugs = params["*"]?.split("/") ?? [];
  console.log("root reload", slugs);
  const tags = await prisma.tag.findMany({
    orderBy: {
      videos: {
        _count: "desc",
      },
    },
  });

  const activeTags =
    slugs.length > 0
      ? await prisma.tag.findMany({
          where: {
            slug: { in: slugs },
          },
        })
      : [];

  await prisma.$disconnect();

  return json({
    tags,
    activeTags,
  });
};

export default function App() {
  const { tags, activeTags } = useLoaderData();
  const [searchParams] = useSearchParams();
  const durationFilter = searchParams.getAll("duration") ?? ["all"];
  const fetcher = useFetcher();
  const transition = useTransition();
  const nextSearchParams = new URLSearchParams(transition.location?.search);
  const nextDuration = nextSearchParams.getAll("duration");

  useEffect(() => {
    console.log(transition.location?.pathname);
    if (transition.location) {
      fetcher.load(transition.location.pathname);
    }
  }, [transition.location]);

  console.log("app reload", activeTags, fetcher.data);
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout>
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
      </body>
    </html>
  );
}
