import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import AppLayout from "./ui/layout";
import "./app.css";

export const meta: Route.MetaFunction = () => [
  { charset: "utf-8" },
  { title: "HasanHub – All clips from Hasanabi streams" },
  {
    name: "viewport",
    content: "width=device-width,initial-scale=1",
  },
  {
    name: "description",
    content:
      "The HasanAbi Clips Industrial Complex App. All clips from 70+ Hasan Piker channels.",
  },
  {
    name: "keywords",
    content: "hasanabi, hasanhub, hasan piker, streamer, youtube, clips, twitch",
  },
  { name: "msapplication-tileColor", content: "#da532c" },
  { name: "theme-color", content: "#7a55b1" },
  { name: "yandex-verification", content: "45afda70569d2af8" },
  { name: "og:image", content: "https://hasanhub.com/og.png" },
];

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico" },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
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
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "preconnect", href: "https://i.ytimg.com" },
  { rel: "dns-prefetch", href: "https://i.ytimg.com" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />

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

export default function App() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      }
    };
  }, []);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Unknown Error";
  let details = "";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
    details = String(error.data ?? "");
  } else if (error instanceof Error) {
    message = "Error";
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="p-6">
      <h1>{message}</h1>
      {details ? <p>{details}</p> : null}
      {stack ? <pre>{stack}</pre> : null}
    </main>
  );
}
