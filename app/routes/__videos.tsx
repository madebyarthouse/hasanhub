import { Outlet, useLoaderData } from "react-router";
import type { TagSidebarRecord } from "../../db/types";
import type { DurationListType, TimeframeType } from "~/utils/validators";
import Sidebar, { MobileHeader } from "~/ui/sidebar";
import { cacheHeader } from "pretty-cache-header";
import { db } from "../../db/client";
import { getTagsForSidebar } from "../../db/queries";
import { TagSlugsValidator } from "~/lib/get-videos";
import { getStreamInfo } from "~/lib/get-stream-info.server";
import type { Route } from "./+types/__videos";
import useUrlState from "~/hooks/use-url-state";

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
  tags: TagSidebarRecord[];
  tagSlugs: string[];
  durations: DurationListType | undefined;
  timeframe: TimeframeType | undefined;
  streamInfo?: StreamInfoDisplay;
  streamSchedule?: StreamScheduleDisplay;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const slugs = url.pathname.startsWith("/tags/")
    ? url.pathname.replace("/tags/", "").split("/")
    : [];

  const tags = await getTagsForSidebar(db);
  const tagSlugs = TagSlugsValidator.parse(slugs) ?? [];

  let streamInfo: StreamInfoDisplay | null = null;
  let streamSchedule: StreamScheduleDisplay | null = null;

  try {
    const [info, schedule] = await getStreamInfo();
    streamInfo = info?.data?.length
      ? {
          user_login: info.data[0].user_login,
          user_name: info.data[0].user_name,
          title: info.data[0].title,
        }
      : null;
    streamSchedule = schedule?.data?.segments?.length
      ? {
          broadcaster_login: schedule.data.broadcaster_login,
          broadcaster_name: schedule.data.broadcaster_name,
          start_time: schedule.data.segments[0].start_time,
          title: schedule.data.segments[0].title,
        }
      : null;
  } catch (error) {
    console.warn("Stream info unavailable:", error);
  }

  return new Response(
    JSON.stringify({
      tags,
      tagSlugs,
      streamInfo,
      streamSchedule,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": cacheHeader({
          maxAge: "3days",
          sMaxage: "1day",
          staleWhileRevalidate: "1week",
        }),
      },
    }
  );
};

export const headers: Route.HeadersFunction = ({ loaderHeaders }) => {
  const cacheControl = loaderHeaders.get("Cache-Control");
  return cacheControl ? { "Cache-Control": cacheControl } : {};
};

export default function VideosLayout() {
  const { tags, streamInfo, streamSchedule } = useLoaderData<typeof loader>();
  const { durations, timeframe, tagSlugs } = useUrlState();

  const context: VideosLayoutContext = {
    tags,
    tagSlugs,
    durations,
    timeframe,
    streamInfo: streamInfo ?? undefined,
    streamSchedule: streamSchedule ?? undefined,
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <MobileHeader
        streamInfo={streamInfo ?? undefined}
        streamSchedule={streamSchedule ?? undefined}
      />
      <Sidebar
        tags={tags}
        streamInfo={streamInfo ?? undefined}
        streamSchedule={streamSchedule ?? undefined}
      />
      <div className="flex-1 lg:overflow-y-auto">
        <Outlet context={context} />
      </div>
    </div>
  );
}
