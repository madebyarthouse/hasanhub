import TagButton from "./tag-button";
import type { DurationType } from "~/utils/validators";
import useActionUrl from "~/hooks/use-action-url";
import useUrlState from "~/hooks/use-url-state";
import { useQuery } from "@tanstack/react-query";
import { fetchTagsForSidebar } from "~/queries/fetch-tags-for-sidebar";
import cx from "classnames";

const durationFilterData: { value: DurationType; label: string }[] = [
  { value: "short", label: "< 3min" },
  { value: "medium", label: "3-15min" },
  { value: "long", label: "15-30min" },
  { value: "extralong", label: "> 30 min" },
];

const Sidebar = () => {
  const { durations, tagSlugs } = useUrlState();

  const { data: tags } = useQuery({
    queryKey: ["tagsForSidear"],
    queryFn: fetchTagsForSidebar,
  });

  return (
    <>
      <aside
        className="transition-opacity duration-100 will-fade "
        style={{
          animationDuration: `250ms`,
          animationName: "appear",
        }}
      >
        <section className="lg:pr-3 flex flex-col gap-y-5">
          {/* Time */}
          <ul className="flex flex-row flex-nowrap pb-3 sm:pb-0 overflow-x-auto sm:overflow-x-visible sm:flex-wrap rounded gap-3">
            {durationFilterData.map(({ value, label }, index) => (
              <li className="min-w-max will-fade-scale" key={value}>
                <DynamicTagButton
                  type="duration"
                  label={label}
                  active={durations?.includes(value) ?? false}
                  filter={value}
                />
              </li>
            ))}
          </ul>

          {/* Tags  */}
          <ul className="grid pb-3  lg:pb-0  grid-flow-col grid-rows-2 sm:grid-rows-4 lg:flex lg:flex-row flex-nowrap lg:flex-wrap gap-y-2 gap-x-3 text-base overflow-x-auto lg:overflow-x-visible">
            {tags?.map((tag, index) => (
              <li
                style={{
                  animationDuration: `${Math.min(50 + index * 50, 1500)}ms`,
                  animationName: "fadeIn",
                }}
                className={cx("will-fade-scale transition-opacity min-w-max")}
                key={tag.id}
              >
                <DynamicTagButton
                  type="tag"
                  label={tag.name}
                  active={tagSlugs?.includes(tag.slug ?? "")}
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
