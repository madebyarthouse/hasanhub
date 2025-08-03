import TagButton from "./tag-button";
import type { DurationType, TimeframeType } from "~/utils/validators";
import useActionUrl from "~/hooks/use-action-url";
import useUrlState from "~/hooks/use-url-state";
import type { Tag } from "@prisma/client";
import { Logo, StreamInfoComponent } from "./header";
import clsx from "clsx";

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

const durationFilterData: { value: DurationType; label: string }[] = [
  { value: "short", label: "< 3min" },
  { value: "medium", label: "3-15min" },
  { value: "long", label: "15-30min" },
  { value: "extralong", label: "> 30 min" },
];

const timeframeFilterData: { value: TimeframeType; label: string }[] = [
  { value: "recent", label: "Last 24h" },
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "quarter", label: "Last Quarter" },
  { value: "year", label: "Last Year" },
];

// Mobile Header Component
const MobileHeader = ({
  streamInfo,
  streamSchedule,
}: {
  streamInfo?: StreamInfoDisplay;
  streamSchedule?: StreamScheduleDisplay;
}) => {
  return (
    <header className="lg:hidden w-full px-5 py-6 gap-x-1 gap-y-6 md:py-8 border-b flex flex-col sm:flex-row justify-between border-gray-200 dark:border-gray-700">
      {/* Logo and stream info column */}
      <div className="flex flex-col justify-between gap-4">
        <div className="flex flex-row justify-between items-center gap-4">
          <Logo />
          <div className="sm:hidden flex">
            <SidebarSocialLinks className="flex-wrap" />
          </div>
        </div>

        <StreamInfoComponent
          streamInfo={streamInfo}
          streamSchedule={streamSchedule}
        />
      </div>

      {/* Credits and social column */}
      <div className="flex justify-between  sm:flex-col items-center sm:items-end gap-4">
        <div className="hidden sm:block">
          <SidebarSocialLinks />
        </div>
        <div className="font-semibold">
          Made by{" "}
          <a
            href="https://chrcit.com/projects/hasanhub-com"
            className="underline underline-offset-2 font-semibold"
          >
            chrcit
          </a>
        </div>
      </div>
    </header>
  );
};

// Local SocialLinks component for sidebar (supports vertical layout)
const TwitterIcon = () => (
  <svg
    className="w-7 h-7"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    className="w-7 h-7"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const SidebarSocialLinks = ({ className }: { className?: string }) => {
  return (
    <div className={clsx("flex items-center", className)}>
      <a
        href="https://twitter.com/hasanhub_com"
        target="_blank"
        rel="noreferrer"
        aria-label="Follow on Twitter"
        className="text-[#26a7de] dark:text-white dark:hover:text-[#26a7de] transition-colors duration-200 p-2"
      >
        <TwitterIcon />
      </a>
      <a
        href="https://github.com/chrcit/hasanhub"
        target="_blank"
        rel="noreferrer"
        aria-label="View on GitHub"
        className="text-[#333333] dark:text-white hover:text-[#000000] dark:hover:text-gray-300 transition-colors duration-200 p-2"
      >
        <GitHubIcon />
      </a>
    </div>
  );
};

// Sidebar Header Component (Sticky)
const SidebarHeader = ({
  streamInfo,
  streamSchedule,
}: {
  streamInfo?: StreamInfoDisplay;
  streamSchedule?: StreamScheduleDisplay;
}) => {
  return (
    <div className="sticky top-0 dark:bg-gray-900 z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="px-5 py-1">
        <div className="flex flex-col gap-3 mt-4">
          <Logo />
          <StreamInfoComponent
            streamInfo={streamInfo}
            streamSchedule={streamSchedule}
          />
        </div>
      </div>
    </div>
  );
};

// Sidebar Footer Component (Sticky)
const SidebarFooter = () => {
  return (
    <div className="sticky bottom-0 dark:bg-gray-900 z-10 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div className="px-5 pb-4">
        <div className="flex flex-row justify-between items-center gap-2">
          <div className="text-gray-600 dark:text-gray-400">
            Made by{" "}
            <a
              href="https://chrcit.com/projects/hasanhub-com"
              className="underline underline-offset-2 font-semibold"
            >
              chrcit
            </a>
          </div>
          <SidebarSocialLinks />
        </div>
      </div>
    </div>
  );
};

// Scrollable Filters Component
const SidebarFilters = ({ tags }: { tags: Tag[] }) => {
  const {
    tagSlugs: activeTagSlugs,
    durations: durationFilter,
    timeframe: timeframeFilter,
  } = useUrlState();

  // Count active filters
  const activeTimeframeCount = timeframeFilter ? 1 : 0;
  const activeDurationCount = durationFilter?.length ?? 0;
  const activeTagsCount =
    activeTagSlugs?.filter((slug) => slug && slug.trim() !== "").length ?? 0;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 sidebar-scrollbar">
      <section className="flex flex-col gap-y-5">
        {/* Timeframe */}
        <details className="group" open>
          <summary className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-200 cursor-pointer list-none flex items-center justify-between">
            <div className="flex items-center gap-2">
              Timeframe
              {activeTimeframeCount > 0 && (
                <div className="w-2.5 h-2.5 rounded-full bg-twitchPurpleLight"></div>
              )}
            </div>
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <ul className="flex flex-row flex-nowrap pb-3 sm:pb-0 overflow-x-auto sm:overflow-x-visible sm:flex-wrap rounded gap-3">
            {timeframeFilterData.map(({ value, label }, index) => (
              <li className="min-w-max will-fade-scale" key={value}>
                <DynamicTagButton
                  type="timeframe"
                  label={label}
                  active={timeframeFilter === value}
                  filter={value ?? ""}
                />
              </li>
            ))}
          </ul>
        </details>

        {/* Duration */}
        <details className="group" open>
          <summary className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-200 cursor-pointer list-none flex items-center justify-between">
            <div className="flex items-center gap-2">
              Duration
              {activeDurationCount > 0 && (
                <div className="w-2.5 h-2.5 rounded-full bg-twitchPurpleLight"></div>
              )}
            </div>
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <ul className="flex flex-row flex-nowrap pb-3 sm:pb-0 overflow-x-auto sm:overflow-x-visible sm:flex-wrap rounded gap-3">
            {durationFilterData.map(({ value, label }, index) => (
              <li className="min-w-max will-fade-scale" key={value}>
                <DynamicTagButton
                  type="duration"
                  label={label}
                  active={durationFilter?.includes(value) ?? false}
                  filter={value}
                />
              </li>
            ))}
          </ul>
        </details>

        {/* Tags  */}
        <details className="group" open>
          <summary className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-200 cursor-pointer list-none flex items-center justify-between">
            <div className="flex items-center gap-2">
              Tags
              {activeTagsCount > 0 && (
                <div className="w-2.5 h-2.5 rounded-full bg-twitchPurpleLight"></div>
              )}
            </div>
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <ul className="grid pb-3  lg:pb-0  grid-flow-col grid-rows-2 sm:grid-rows-4 lg:flex lg:flex-row flex-nowrap lg:flex-wrap gap-y-2 gap-x-3 text-base overflow-x-auto lg:overflow-x-visible">
            {tags?.map((tag, index) => (
              <li className="min-w-max" key={tag.id}>
                <DynamicTagButton
                  type="tag"
                  label={tag.name}
                  active={activeTagSlugs?.includes(tag.slug ?? "")}
                  filter={tag.slug ?? ""}
                />
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
};

// Main Sidebar Component
const Sidebar = ({
  tags,
  streamInfo,
  streamSchedule,
}: {
  tags: Tag[];
  streamInfo?: StreamInfoDisplay;
  streamSchedule?: StreamScheduleDisplay;
}) => {
  return (
    <aside className="hidden lg:flex flex-col h-screen w-80 xl:w-96  dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <SidebarHeader streamInfo={streamInfo} streamSchedule={streamSchedule} />
      <SidebarFilters tags={tags} />
      <SidebarFooter />
    </aside>
  );
};

const DynamicTagButton = ({
  label,
  type,
  filter,
  active,
}: {
  type: "tag" | "duration" | "timeframe";
  label: string;
  filter: string;
  active: boolean;
}) => {
  const { current, constructUrl } = useActionUrl();

  const href =
    type === "tag"
      ? constructUrl({
          tagSlugs: current.tagSlugs.includes(filter) ? [] : [filter],
          lastVideoId: undefined,
        })
      : type === "duration"
      ? constructUrl({
          durations: addOrRemoveElement(
            current.durations,
            filter as DurationType
          ),
          lastVideoId: undefined,
        })
      : constructUrl({
          timeframe:
            current.timeframe === filter
              ? undefined
              : (filter as TimeframeType),
          lastVideoId: undefined,
        });

  return (
    <TagButton
      href={href}
      styleVariant="sidebar"
      label={label}
      active={active}
    />
  );
};

const addOrRemoveElement = <T extends string>(
  arr: T[] | undefined,
  element: T
): T[] => {
  if (arr?.includes(element)) {
    return arr.filter((e) => e !== element).sort();
  }

  return [...(arr ?? []), element].sort() as T[];
};

export { MobileHeader };
export default Sidebar;
