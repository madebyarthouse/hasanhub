import type { Tag } from "@prisma/client";
import TagButton from "./tagButton";
import { motion } from "framer-motion";
import type { TimeFilterOptions } from "./filters";

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

const Sidebar = ({
  tags,
  activeTags,
  durationFilter,
}: {
  tags: Tag[];
  activeTags: Tag[];
  durationFilter: TimeFilterOptions;
}) => {
  const activeTagSlugs = activeTags.map((tag) => tag.slug ?? "");

  return (
    <>
      <motion.aside
        layout
        className="w-full lg:sticky lg:top-0 lg:w-1/4 xl:w-1/5  py-5     px-3 lg:px-0"
      >
        <div className="lg:overflow-y-auto lg:max-h-[calc(100vh-2.5rem)] lg:pr-3 flex flex-col gap-y-5">
          {/* Time */}
          <motion.ul
            className="flex flex-row flex-wrap rounded gap-3"
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { value: "all", label: "All" },
              { value: "short", label: "< 2min" },
              { value: "medium", label: "2-15min" },
              { value: "long", label: "15-30min" },
              { value: "extralong", label: "> 30 min" },
            ].map(({ value, label }) => (
              <motion.li variants={gridElVariant} key={value}>
                <TagButton
                  href={`?duration=${value}`}
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
            className="grid pb-3  lg:pb-0  grid-flow-col grid-rows-4 lg:flex lg:flex-row flex-nowrap lg:flex-wrap gap-y-2 gap-x-3 text-base overflow-x-auto lg:overflow-x-visible"
          >
            {tags.map((tag) => (
              <motion.li variants={gridElVariant} key={tag.id}>
                <TagButton
                  href={`/tags/${tag.slug}`}
                  styleVariant="sidebar"
                  label={tag.name}
                  active={activeTagSlugs.includes(tag.slug ?? "")}
                />
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
