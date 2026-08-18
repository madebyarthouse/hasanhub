import { Outlet, useLoaderData } from "react-router";
import type { TagSidebarRecord } from "../../db/types";
import type { DurationListType, TimeframeType } from "~/utils/validators";
import Sidebar, { MobileHeader } from "~/ui/sidebar";
import { cacheHeader } from "pretty-cache-header";
import { db } from "../../db/client";
import { getTagsForSidebar } from "../../db/queries";
import { TagSlugsValidator } from "~/lib/get-videos";
import { getStreamInfo } from "~/lib/get-stream-info.server";
import { isCrawlerRequest } from "~/lib/crawler.server";
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

/** Mirrors former KV TTL (1 day) with SWR. */
const TAGS_SIDEBAR_CACHE_POLICY = {
  public: true,
  maxAge: "1day",
  staleWhileRevalidate: "1week",
} as const;

export type VideosLayoutContext = {
  tags: TagSidebarRecord[];
  tagSlugs: string[];
  durations: DurationListType | undefined;
  timeframe: TimeframeType | undefined;
  streamInfo?: StreamInfoDisplay;
  streamSchedule?: StreamScheduleDisplay;
};

const emptyStreamDisplay: {
  streamInfo: StreamInfoDisplay | null;
  streamSchedule: StreamScheduleDisplay | null;
} = {
  streamInfo: null,
  streamSchedule: null,
};

const loadStreamDisplay = async () => {
  const [info, schedule] = await getStreamInfo();
  return {
    streamInfo: info?.data?.length
      ? {
          user_login: info.data[0].user_login,
          user_name: info.data[0].user_name,
          title: info.data[0].title,
        }
      : null,
    streamSchedule: schedule?.data?.segments?.length
      ? {
          broadcaster_login: schedule.data.broadcaster_login,
          broadcaster_name: schedule.data.broadcaster_name,
          start_time: schedule.data.segments[0].start_time,
          title: schedule.data.segments[0].title,
        }
      : null,
  };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const slugs = url.pathname.startsWith("/tags/")
    ? url.pathname.replace("/tags/", "").split("/").filter(Boolean)
    : [];

  if (url.pathname.startsWith("/tags/") && slugs.length !== 1) {
    throw new Response("Not found", { status: 404, statusText: "Not found" });
  }

  const tagSlugs = TagSlugsValidator.parse(slugs) ?? [];
  // Single fetch runs this layout loader in the same Worker request as the
  // leaf route. Start Twitch and sidebar D1 together so they overlap with it.
  // allSettled keeps a broken Twitch call from failing the layout (and videos).
  const [tagsResult, streamResult] = await Promise.allSettled([
    getTagsForSidebar(db),
    isCrawlerRequest(request) ? emptyStreamDisplay : loadStreamDisplay(),
  ]);

  if (tagsResult.status === "rejected") {
    throw tagsResult.reason;
  }

  if (streamResult.status === "rejected") {
    console.warn("Stream info unavailable:", streamResult.reason);
  }

  const tags = tagsResult.value;
  const { streamInfo, streamSchedule } =
    streamResult.status === "fulfilled"
      ? streamResult.value
      : emptyStreamDisplay;

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
        "Cache-Control": cacheHeader(TAGS_SIDEBAR_CACHE_POLICY),
      },
    }
  );
};

export const headers: Route.HeadersFunction = ({ loaderHeaders }) => {
  const headers: Record<string, string> = {};
  const cacheControl = loaderHeaders.get("Cache-Control");
  const robotsTag = loaderHeaders.get("X-Robots-Tag");
  if (cacheControl) headers["Cache-Control"] = cacheControl;
  if (robotsTag) headers["X-Robots-Tag"] = robotsTag;
  return headers;
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
