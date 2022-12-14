import type { Tag } from "@prisma/client";
import TagButton from "./tag-button";

const Taglist = ({ tags }: { tags: Tag[] }) => {
  return (
    <ul className="flex flex-row flex-wrap px-3 lg:px-0 gap-3 text-sm w-full pb-3 overflow-x-auto">
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
