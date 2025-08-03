import type { DurationType, TimeframeType } from "~/utils/validators";
import useActionUrl from "~/hooks/use-action-url";
import useUrlState from "~/hooks/use-url-state";
import { Link } from "@remix-run/react";
import cx from "classnames";
import { Drawer } from "vaul";
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

const FilterModal = ({ tags }: { tags: Tag[] }) => {
  const {
    tagSlugs: activeTagSlugs,
    durations: durationFilter,
    timeframe: timeframeFilter,
  } = useUrlState();
  const { ordering } = useUrlState();
  const { constructUrl } = useActionUrl();

  // Count active filters
  const activeTimeframeCount = timeframeFilter ? 1 : 0;
  const activeDurationCount = durationFilter?.length ?? 0;
  const activeTagsCount =
    activeTagSlugs?.filter((slug) => slug && slug.trim() !== "").length ?? 0;

  const defaultOrdering = { by: "publishedAt", order: "desc" } as const;
  const orderingChanged =
    ordering.by !== defaultOrdering.by ||
    ordering.order !== defaultOrdering.order;
  const activeSortingCount = orderingChanged ? 1 : 0;

  const totalActiveFilters =
    activeTimeframeCount +
    activeDurationCount +
    activeTagsCount +
    activeSortingCount;

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button
          className="lg:hidden flex items-center justify-center p-2 rounded-lg border border-twitchPurple text-twitchPurple dark:text-twitchPurple betterhover:hover:bg-twitchPurple dark:betterhover:hover:bg-twitchPurple betterhover:hover:text-light transition-colors duration-200 relative"
          aria-label="Open filters and sorting"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
          </svg>
          {totalActiveFilters > 0 && (
            <div className="absolute -top-1 -right-1 bg-twitchPurpleLight text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {totalActiveFilters}
            </div>
          )}
        </button>
      </Drawer.Trigger>

      <Drawer.Portal
        container={typeof document !== "undefined" ? document.body : null}
      >
        <Drawer.Overlay className="fixed inset-0 bg-black/40 lg:hidden z-[9999]" />
        <Drawer.Content className="bg-light dark:bg-lightBlack flex flex-col rounded-t-[10px] h-[96dvh] max-h-[96dvh] overflow-hidden fixed bottom-0 left-0 right-0 lg:hidden z-[9999]">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600 mb-8 mt-4" />
          <div className="px-3.5 pb-6 flex-1 overflow-y-auto">
            {/* Sorting Controls */}
            <details className="group mb-8" open>
              <summary className="text-lg font-semibold mb-4 cursor-pointer list-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Sorting & Ordering
                  {orderingChanged && (
                    <div className="w-2.5 h-2.5 rounded-full bg-twitchPurpleLight"></div>
                  )}
                </div>
                <svg
                  className="w-5 h-5 transition-transform group-open:rotate-180"
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

              <div className="flex flex-col gap-3">
                {/* Sort Type and Order side by side */}
                <div className="flex flex-row flex-wrap gap-x-3 gap-y-5">
                  <ul className="flex flex-row gap-0">
                    <li>
                      <Drawer.Close asChild>
                        <Link
                          className={cx(
                            "border-twitchPurpleLight duration-400 transition-colors border border-r-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg text-sm rounded-r-none",
                            ordering.by === "publishedAt"
                              ? "bg-twitchPurpleLight text-light"
                              : "bg-light dark:bg-lightBlack text-twitchPurpleLight"
                          )}
                          to={constructUrl({
                            ordering: {
                              by: "publishedAt",
                              order: ordering.order,
                            },
                          })}
                        >
                          Date
                        </Link>
                      </Drawer.Close>
                    </li>
                    <li>
                      <Drawer.Close asChild>
                        <Link
                          className={cx(
                            "border-twitchPurpleLight duration-400 transition-colors border border-l-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-l-none text-sm",
                            ordering.by === "views"
                              ? "bg-twitchPurpleLight text-light"
                              : "bg-light dark:bg-lightBlack text-twitchPurpleLight"
                          )}
                          to={constructUrl({
                            ordering: { by: "views", order: ordering.order },
                          })}
                        >
                          Popularity
                        </Link>
                      </Drawer.Close>
                    </li>
                  </ul>

                  <ul className="flex flex-row gap-0">
                    <li>
                      <Drawer.Close asChild>
                        <Link
                          className={cx(
                            "border-twitchPurpleLight duration-400 transition-colors border border-r-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-r-none text-sm",
                            ordering.order === "asc"
                              ? "bg-twitchPurpleLight text-light"
                              : "bg-light dark:bg-lightBlack text-twitchPurpleLight"
                          )}
                          to={constructUrl({
                            ordering: { order: "asc", by: ordering.by },
                          })}
                        >
                          Asc
                        </Link>
                      </Drawer.Close>
                    </li>
                    <li>
                      <Drawer.Close asChild>
                        <Link
                          className={cx(
                            "border-twitchPurpleLight duration-400 transition-colors border border-l-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-l-none text-sm",
                            ordering.order === "desc"
                              ? "bg-twitchPurpleLight text-light"
                              : "bg-light dark:bg-lightBlack text-twitchPurpleLight"
                          )}
                          to={constructUrl({
                            ordering: { order: "desc", by: ordering.by },
                          })}
                        >
                          Desc
                        </Link>
                      </Drawer.Close>
                    </li>
                  </ul>
                </div>
              </div>
            </details>

            {/* Timeframe Filters */}
            <details className="group mb-8" open>
              <summary className="text-lg font-semibold mb-4 cursor-pointer list-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Timeframe
                  {activeTimeframeCount > 0 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-twitchPurpleLight"></div>
                  )}
                </div>
                <svg
                  className="w-5 h-5 transition-transform group-open:rotate-180"
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
              <ul className="flex flex-row flex-wrap gap-3">
                {timeframeFilterData.map(({ value, label }) => (
                  <li key={value}>
                    <DrawerTagButton
                      type="timeframe"
                      label={label}
                      active={timeframeFilter === value}
                      filter={value ?? ""}
                    />
                  </li>
                ))}
              </ul>
            </details>

            {/* Duration Filters */}
            <details className="group mb-8" open>
              <summary className="text-lg font-semibold mb-4 cursor-pointer list-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Duration
                  {activeDurationCount > 0 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-twitchPurpleLight"></div>
                  )}
                </div>
                <svg
                  className="w-5 h-5 transition-transform group-open:rotate-180"
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
              <ul className="flex flex-row flex-wrap gap-3">
                {durationFilterData.map(({ value, label }) => (
                  <li key={value}>
                    <DrawerTagButton
                      type="duration"
                      label={label}
                      active={durationFilter?.includes(value) ?? false}
                      filter={value}
                    />
                  </li>
                ))}
              </ul>
            </details>

            {/* Tag Filters */}
            <details className="group" open>
              <summary className="text-lg font-semibold mb-4 cursor-pointer list-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Tags
                  {activeTagsCount > 0 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-twitchPurpleLight"></div>
                  )}
                </div>
                <svg
                  className="w-5 h-5 transition-transform group-open:rotate-180"
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
              <ul className="flex flex-row flex-wrap gap-3">
                {tags?.map((tag) => (
                  <li key={tag.id}>
                    <DrawerTagButton
                      type="tag"
                      label={tag.name}
                      active={activeTagSlugs?.includes(tag.slug ?? "")}
                      filter={tag.slug ?? ""}
                    />
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

const DrawerTagButton = ({
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
    <Drawer.Close asChild>
      <Link
        to={href}
        className={cx(
          "border-twitchPurpleLight duration-400 transition-colors border betterhover:hover:bg-twitchPurple betterhover:hover:text-light inline-block rounded-lg saturate-50 text-base px-3 py-2 min-w-min",
          active
            ? "bg-twitchPurpleLight text-light"
            : "bg-light dark:bg-lightBlack text-twitchPurpleLight"
        )}
      >
        {label}
      </Link>
    </Drawer.Close>
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

export default FilterModal;
