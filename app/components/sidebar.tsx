import type { Tag } from "@prisma/client";
import TagButton from "./tagButton";
import type { DurationListType, DurationType } from "~/utils/validators";
import useActionUrl from "~/hooks/useActionUrl";

const constructUrl = (
  activeSlugs: string[],
  newSlug: string | null,
  activeDurationFilter: DurationListType | undefined,
  newDuration: DurationType | null
) => {
  let slugs = activeSlugs;
  if (newSlug) {
    slugs = activeSlugs.includes(newSlug)
      ? activeSlugs.filter((slug) => slug !== newSlug)
      : [...activeSlugs, newSlug];
    slugs = slugs.sort();
  }

  let durations: DurationListType = [];
  if (activeDurationFilter === undefined) {
    durations = newDuration ? [newDuration] : [];
  } else if (newDuration) {
    durations = activeDurationFilter.includes(newDuration)
      ? activeDurationFilter.filter((d) => d !== newDuration)
      : [...activeDurationFilter, newDuration];
    durations = durations.sort();
  }
};

const durationFilterData: { value: DurationType; label: string }[] = [
  { value: "short", label: "< 3min" },
  { value: "medium", label: "3-15min" },
  { value: "long", label: "15-30min" },
  { value: "extralong", label: "> 30 min" },
];

const Sidebar = ({
  tags,
  activeTagSlugs,
  durationFilter,
}: {
  tags: Tag[];
  activeTagSlugs: string[];
  durationFilter: DurationListType | undefined;
}) => {
  return (
    <>
      <aside className="w-full lg:sticky lg:top-0 lg:w-1/4 xl:w-1/5  py-5 px-3 lg:px-0 transition-opacity duration-100">
        <section className="lg:overflow-y-auto lg:max-h-[calc(100vh-2.5rem)] lg:pr-3 flex flex-col gap-y-5">
          {/* Time */}
          <ul className="flex flex-row flex-nowrap pb-3 sm:pb-0 overflow-x-auto sm:overflow-x-visible sm:flex-wrap rounded gap-3">
            {durationFilterData.map(({ value, label }, index) => (
              <li
                className="min-w-max will-fade-scale"
                key={value}
                style={{
                  animationDuration: `${
                    250 + index * (index < 10 ? 50 : 25)
                  }ms`,
                  animationName: "fadeIn",
                }}
              >
                <DynamicTagButton
                  type="duration"
                  label={label}
                  active={durationFilter?.includes(value) ?? false}
                  filter={value}
                />
              </li>
            ))}
          </ul>

          {/* Tags  */}
          <ul className="grid pb-3  lg:pb-0  grid-flow-col grid-rows-2 sm:grid-rows-4 lg:flex lg:flex-row flex-nowrap lg:flex-wrap gap-y-2 gap-x-3 text-base overflow-x-auto lg:overflow-x-visible">
            {tags.map((tag, index) => (
              <li
                className="min-w-max"
                style={{
                  animationDuration: `${
                    250 + index * (index < 15 ? 50 : 25)
                  }ms`,
                  animationName: "fadeIn",
                }}
                key={tag.id}
              >
                <DynamicTagButton
                  type="tag"
                  label={tag.name}
                  active={activeTagSlugs?.includes(tag.slug ?? "")}
                  filter={tag.slug ?? ""}
                />
              </li>
            ))}
          </ul>
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
  type: "tag" | "duration";
  label: string;
  filter: string;
  active: boolean;
}) => {
  const { current, constructUrl } = useActionUrl();

  const href =
    type === "tag"
      ? constructUrl({
          tagSlugs: addOrRemoveElement(current.tagSlugs, filter),
          lastVideoId: undefined,
        })
      : constructUrl({
          durations: addOrRemoveElement(current.durations, filter),
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

const addOrRemoveElement = (arr?: string[], element: string) => {
  if (arr?.includes(element)) {
    return arr.filter((e) => e !== element).sort();
  }

  return [...(arr ?? []), element].sort();
};

export default Sidebar;
