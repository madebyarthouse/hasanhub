import TagButton from "./tag-button";
import type { DurationType, TimeframeType } from "~/utils/validators";
import useActionUrl from "~/hooks/use-action-url";
import useUrlState from "~/hooks/use-url-state";
import type { Tag } from "@prisma/client";

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

const Sidebar = ({ tags }: { tags: Tag[] }) => {
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
    <>
      <aside
        className="transition-opacity duration-100 will-fade sidebar-scrollbar"
        style={{
          animationDuration: `250ms`,
          animationName: "appear",
        }}
      >
        <section className="lg:pr-3 flex flex-col gap-y-5">
          {/* Timeframe */}
          <details className="group" open>
            <summary className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-200 cursor-pointer list-none flex items-center justify-between">
              <div className="flex items-center gap-2">
                Timeframe
                {activeTimeframeCount > 0 && (
                  <div className="bg-twitchPurpleLight text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {activeTimeframeCount}
                  </div>
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
                  <div className="bg-twitchPurpleLight text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {activeDurationCount}
                  </div>
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
                  <div className="bg-twitchPurpleLight text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {activeTagsCount}
                  </div>
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
      </aside>
    </>
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

export default Sidebar;
