import { Tag } from "@prisma/client";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useState } from "react";
import { TimeFilterOptions } from "./components/filters";
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
  const tags = await prisma.tag.findMany({
    orderBy: {
      videos: {
        _count: "desc",
      },
    },
  });

  const activeTags = params.tagSlug
    ? await prisma.tag.findMany({
        where: {
          slug: { in: params.tagSlug },
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
  const durationFilter = searchParams.get("duration") ?? "all";
  const transition = useTransition();

  const nextSearchParams = new URLSearchParams(transition.location?.search);
  const nextDuration = nextSearchParams.get("duration");

  const handleTimeFilterChange = async (value: TimeFilterOptions) => {
    console.log(value);
  };

  const handleTagsChanged = async (slugs: string[]) => {};

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
            activeTags={activeTags}
            durationFilter={nextDuration ?? durationFilter}
            handleTagsChanged={handleTagsChanged}
            setTimeFilter={handleTimeFilterChange}
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
