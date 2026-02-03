import type { TagSidebarRecord } from "../../db/types";
import TagButton from "./tag-button";

const Taglist = ({ tags }: { tags: TagSidebarRecord[] }) => {
  return (
    <ul className="flex flex-row flex-wrap gap-3 lg:gap-2 xl:gap-1 text-sm w-full pb-3">
      {tags.map((tag) => (
        <li key={tag.id}>
          <TagButton
            href={`/tags/${tag.slug}`}
            styleVariant="taglist"
            label={tag.name}
            key={tag.id}
          />
        </li>
      ))}
    </ul>
  );
};

export default Taglist;
