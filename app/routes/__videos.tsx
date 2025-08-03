import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { cacheHeader } from "pretty-cache-header";
import useUrlState from "~/hooks/use-url-state";
import { TagSlugsValidator } from "~/lib/get-videos";
import { debug } from "~/utils/debug.server";
import type { Tag } from "@prisma/client";
import type { DurationListType, TimeframeType } from "~/utils/validators";

import Sidebar, { MobileHeader } from "~/ui/sidebar";

// Component-specific types that match the transformed data from root.tsx
type StreamInfoDisplay = {
  user_login: string;
  user_name: string;
  title: string;
};

type StreamScheduleDisplay = {
  broadcaster_login: string;
  broadcaster_name: string;
  start_time: string;
  title: string;
};

export type VideosLayoutContext = {
  tags: Tag[];
  tagSlugs: string[];
  durations: DurationListType | undefined;
  timeframe: TimeframeType | undefined;
  streamInfo?: StreamInfoDisplay;
  streamSchedule?: StreamScheduleDisplay;
};

export function headers() {
  return {
    "Cache-Control": cacheHeader({
      sMaxage: "1day",
      staleWhileRevalidate: "1week",
    }),
  };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const slugs = params["*"]?.split("/") ?? [];

  const BASE_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const [tagsResponse, streamResponse] = await Promise.all([
      fetch(`${BASE_URL}/api/get-tags-for-sidebar`),
      fetch(`${BASE_URL}/api/get-stream-info`),
    ]);

    const [streamInfoRaw, streamScheduleRaw] = await streamResponse.json();

    const tagsData = await tagsResponse.json();
    const tagSlugs = TagSlugsValidator.parse(slugs) ?? [];

    // Transform stream data to match component interface
    const streamInfo = streamInfoRaw?.data?.length
      ? {
          user_login: streamInfoRaw.data[0].user_login,
          user_name: streamInfoRaw.data[0].user_name,
          title: streamInfoRaw.data[0].title,
        }
      : null;

    const streamSchedule = streamScheduleRaw?.data?.segments.length
      ? {
          broadcaster_login: streamScheduleRaw.data.broadcaster_login,
          broadcaster_name: streamScheduleRaw.data.broadcaster_name,
          start_time: streamScheduleRaw.data.segments[0].start_time,
          title: streamScheduleRaw.data.segments[0].title,
        }
      : null;

    return json(
      {
        tags: tagsData ?? [],
        tagSlugs,
        streamInfo,
        streamSchedule,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": cacheHeader({
            maxAge: "3days",
            sMaxage: "1day",
            staleWhileRevalidate: "1week",
          }),
        },
      }
    );
  } catch (e) {
    debug(e);
    return json({ error: e });
  }
};

export default function VideosLayout() {
  const { tags, streamInfo, streamSchedule } = useLoaderData<typeof loader>();
  const { durations, timeframe, tagSlugs } = useUrlState();

  const context: VideosLayoutContext = {
    tags,
    tagSlugs,
    durations,
    timeframe,
    streamInfo,
    streamSchedule,
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Mobile Header - shown on mobile/tablet */}
      <MobileHeader streamInfo={streamInfo} streamSchedule={streamSchedule} />

      {/* Sidebar - hidden on mobile/tablet */}
      <Sidebar
        tags={tags}
        streamInfo={streamInfo}
        streamSchedule={streamSchedule}
      />

      {/* Content Area */}
      <div className="flex-1 lg:overflow-y-auto">
        <Outlet context={context} />
      </div>
    </div>
  );
}
