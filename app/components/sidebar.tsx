import type { Tag } from "@prisma/client";
import TagButton from "./tagButton";
import type { TimeFilterOptions } from "./filters";
import { useEffect, useState } from "react";

const constructUrl = (
  base: string,
  activeSlugs: string[],
  newSlug: string | null,
  activeDurationFilter: TimeFilterOptions[],
  newDuration: TimeFilterOptions | null
) => {
  let slugs = activeSlugs;
  if (newSlug) {
    slugs = activeSlugs.includes(newSlug)
      ? activeSlugs.filter((slug) => slug !== newSlug)
      : [...activeSlugs, newSlug];
    slugs = slugs.sort();
  }

  const slugParams = slugs.join("/");

  let durations = activeDurationFilter;
  if (newDuration) {
    durations = activeDurationFilter.includes(newDuration)
      ? activeDurationFilter.filter((d) => d !== newDuration)
      : [...activeDurationFilter, newDuration];
    durations = durations.sort();
  }

  const durationParams = durations
    .map((option) => `duration=${option}`)
    .join("&");

  let fullUrl = `${base}${slugParams}?${durationParams}`;

  return fullUrl.endsWith(`${base}?${durationParams}`)
    ? "/" + fullUrl.replace(base, "")
    : fullUrl;
};

const Sidebar = ({
  tags,
  activeTags,
  durationFilter,
}: {
  tags: Tag[];
  activeTags: Tag[];
  durationFilter: TimeFilterOptions[];
}) => {
  const [base, setBase] = useState(activeTags.length > 0 ? "/tags/" : "/");
  const activeTagSlugs = activeTags.map((tag) => tag.slug ?? "");
  const durationFilterData: { value: TimeFilterOptions; label: string }[] = [
    { value: "short", label: "< 3min" },
    { value: "medium", label: "3-15min" },
    { value: "long", label: "15-30min" },
    { value: "extralong", label: "> 30 min" },
  ];

  useEffect(() => {
    setBase(activeTags.length > 0 ? "/tags/" : "/");
  }, [activeTags]);

  return (
    <>
      <aside className="w-full lg:sticky lg:top-0 lg:w-1/4 xl:w-1/5  py-5 px-3 lg:px-0 transition-opacity duration-100">
        <section className="lg:overflow-y-auto lg:max-h-[calc(100vh-2.5rem)] lg:pr-3 flex flex-col gap-y-5">
          {/* Time */}
          <ul className="flex flex-row flex-nowrap pb-3 sm:pb-0 overflow-x-auto sm:overflow-x-visible sm:flex-wrap rounded gap-3">
            {durationFilterData.map(({ value, label }, index) => (
              <li
                className="min-w-max"
                key={value}
                style={{
                  animationDuration: `${
                    250 + index * (index < 10 ? 50 : 25)
                  }ms`,
                  animationName: "fadeIn",
                }}
              >
                <TagButton
                  href={constructUrl(
                    base,
                    activeTagSlugs,
                    null,
                    durationFilter,
                    value
                  )}
                  styleVariant="sidebar"
                  label={label}
                  active={durationFilter.includes(value)}
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
                <TagButton
                  href={constructUrl(
                    "/tags/",
                    activeTagSlugs,
                    tag.slug,
                    durationFilter,
                    null
                  )}
                  styleVariant="sidebar"
                  label={tag.name}
                  active={activeTagSlugs.includes(tag.slug ?? "")}
                />
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </>
  );
};

export default Sidebar;
