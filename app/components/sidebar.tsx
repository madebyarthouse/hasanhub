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
      <aside className="w-full lg:sticky lg:top-0 lg:w-1/4 xl:w-1/6  py-5 px-3 lg:px-0 transition-opacity duration-100">
        <section className="lg:overflow-y-auto lg:max-h-[calc(100%-2.5rem)] lg:pr-3 flex flex-col gap-y-5">
          {/* Time */}
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

          {/* Tags  */}
          <section className=" pb-3  lg:pb-0 text-base overflow-x-auto lg:overflow-x-visible">
            <h2 className="text-2xl py-3">Most Popular</h2>
            <ul className="flex flex-row flex-wrap gap-y-3 gap-x-4 py-3 border-b">
              {tags?.slice(0, 12).map((tag, index) => (
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
            {Object.keys(staticTagToTopicMap).map((topic) => (
              <>
                <details className="transition-all border-b open:border-b-0">
                  <summary className="cursor-pointer ">
                    <h3 className="inline-block py-3 text-xl ">{topic}</h3>
                  </summary>
                  <ul className="flex flex-row flex-wrap gap-y-3 gap-x-4 py-3 px-2 border-b">
                    {tags
                      ?.filter((tag) => {
                        return staticTagToTopicMap[topic].includes(tag.name);
                      })
                      .map((tag, index) => (
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
              </>
            ))}

            {/* {tags?.map((tag, index) => (
              <li className="min-w-max" key={tag.id}>
                <DynamicTagButton
                  type="tag"
                  label={tag.name}
                  active={activeTagSlugs?.includes(tag.slug ?? "")}
                  filter={tag.slug ?? ""}
                />
              </li>
            ))} */}
          </section>
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

const staticTagToTopicMap = {
  React: [
    "React",
    "TikTok",
    "Jubilee",
    "Cringe",
    "JCS",
    "CNN",
    "Masterchef",
    "The Button",
    "Vice",
    "Fox News",
  ],
  Creators: [
    "Pokimane",
    "AustinShow",
    "Ludwig Ahgren",
    "Myth",
    "Valkyrae",
    "Mizkif",
    "OTV",
    "Amouranth",
    "Felix Biederman",
    "Maya",
    "Will Neff",
    "JPEGMAFIA",
    "Sykkuno",
    "39daph",
    "Grimes",
    "Adin Ross",
    "QTCinderella",
    "Mia Malkova",
    "Tubbo",
    "Sneako",
    "Shitcamp",
    "XQC",
    "JiDion",
    "Andrew Callaghan",
    "h3h3",
    "Trainwrecks",
    "Twitch",
    "Fear&",
    "Tim Dillon",
  ],
  Gaming: [
    "GTA",
    "Gaming",
    "Rust",
    "Pokemon",
    "Elden Ring",
    "Fortnite",
    "Cyberpunk",
  ],
  Politics: [
    "Trump",
    "Joe Biden",
    "Alexandria Ocasio Cortez",
    "Ukraine",
    "Putin",
    "Police",
    "Climate",
    "Clinton",
    "Texas",
    "Bernie Sanders",
    "Afghanistan",
    "Homeless",
    "Israel",
    "Socialism",
    "Covid",
    "Capitalism",
    "LGBT",
  ],
  Hogs: [
    "Joe Rogan",
    "Ben Shapiro",
    "Jordan Peterson",
    "Tucker Carlson",
    "Steven Crowder",
    "Kyle Rittenhouse",
    "Hunter Biden",
    "Rudy Giuliani",
    "Libs of TikTok",
    "Alex Jones",
    "Charlie Kirk",
    "Christian Walker",
    "Tim Pool",
    "Hogwatch",
    "James Lindsay",
    "CRT",
  ],
  Popculture: [
    "Johnny Depp",
    "Amber Heard",
    "Dave Chappelle",
    "Kanye West",
    "Elon Musk",
    "Crypto/NFTs",
    "r/place",
  ],
  "PUA / Manosphere": ["Incel", "Andrew Tate"],
  "Community / Parasocial": ["Hank Pecker", "Chadvice", "Sex", "Coachella"],
  Other: ["IRL", "Rants"],
};

export default Sidebar;
