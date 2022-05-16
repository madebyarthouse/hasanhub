import type { Tag } from "@prisma/client";
import TagButton from "./tagButton";
import { motion } from "framer-motion";
import type { TimeFilterOptions } from "./filters";
import { useEffect, useState } from "react";

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const gridElVariant = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 1,
    },
  },
};

const constructUrl = (
  base: string,
  activeSlugs: string[],
  newSlug: string | null,
  duration: TimeFilterOptions
) => {
  let slugs = activeSlugs;
  if (newSlug) {
    slugs = activeSlugs.includes(newSlug)
      ? activeSlugs.filter((slug) => slug !== newSlug)
      : [...activeSlugs, newSlug];
  }

  let fullUrl = `${base}${slugs.join("/")}?duration=${duration}`;

  return fullUrl.endsWith(`${base}?duration=${duration}`)
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
  durationFilter: TimeFilterOptions;
}) => {
  const [base, setBase] = useState(activeTags.length > 0 ? "/tags/" : "/");
  const activeTagSlugs = activeTags.map((tag) => tag.slug ?? "");
  const durationFilterData: { value: TimeFilterOptions; label: string }[] = [
    { value: "all", label: "All" },
    { value: "short", label: "< 2min" },
    { value: "medium", label: "2-15min" },
    { value: "long", label: "15-30min" },
    { value: "extralong", label: "> 30 min" },
  ];

  useEffect(() => {
    setBase(activeTags.length > 0 ? "/tags/" : "/");
  }, [activeTags]);

  return (
    <>
      <motion.aside
        layout
        className="w-full lg:sticky lg:top-0 lg:w-1/4 xl:w-1/5  py-5     px-3 lg:px-0"
      >
        <section className="lg:overflow-y-auto lg:max-h-[calc(100vh-2.5rem)] lg:pr-3 flex flex-col gap-y-5">
          {/* Time */}
          <motion.ul
            className="flex flex-row flex-nowrap pb-3 sm:pb-0 overflow-x-auto sm:overflow-x-visible sm:flex-wrap rounded gap-3"
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {durationFilterData.map(({ value, label }) => (
              <motion.li variants={gridElVariant} key={value}>
                <TagButton
                  href={constructUrl(base, activeTagSlugs, null, value)}
                  styleVariant="sidebar"
                  label={label}
                  active={durationFilter === value}
                />
              </motion.li>
            ))}
          </motion.ul>

          {/* Tags  */}
          <motion.ul
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid pb-3  lg:pb-0  grid-flow-col grid-rows-2 sm:grid-rows-4 lg:flex lg:flex-row flex-nowrap lg:flex-wrap gap-y-2 gap-x-3 text-base overflow-x-auto lg:overflow-x-visible"
          >
            {tags.map((tag) => (
              <motion.li variants={gridElVariant} key={tag.id}>
                <TagButton
                  href={constructUrl(
                    "/tags/",
                    activeTagSlugs,
                    tag.slug,
                    durationFilter
                  )}
                  styleVariant="sidebar"
                  label={tag.name}
                  active={activeTagSlugs.includes(tag.slug ?? "")}
                />
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </motion.aside>
    </>
  );
};

export default Sidebar;
