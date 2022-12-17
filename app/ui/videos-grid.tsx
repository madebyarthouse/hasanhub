import VideoGridItem from "./video-grid-item";
import cx from "classnames";
import LoadingSpinner from "./loading-spinner";
import useUrlState from "~/hooks/use-url-state";
import useActionUrl from "~/hooks/use-action-url";
import { Link } from "@remix-run/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchActiveTags } from "~/queries/fetch-active-tags";
import { fetchVideos } from "~/queries/fetch-videos";
import { Fragment } from "react";

const VideosGrid = () => {
  const { isLoading, ordering, tagSlugs, durations } = useUrlState();
  const { constructUrl } = useActionUrl();

  const { data: activeTags } = useQuery(
    ["activeTags", tagSlugs],
    () => {
      return tagSlugs ? fetchActiveTags(tagSlugs) : [];
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const {
    data: videosData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [
      "videos",
      ...tagSlugs,
      ...(durations ?? []),
      ordering.by,
      ordering.order,
    ],
    queryFn: async ({ pageParam = undefined }) => {
      return fetchVideos({
        tagSlugs,
        durations,
        order: ordering.order,
        by: ordering.by,
        lastVideoId: pageParam,
      });
    },
    getNextPageParam: (lastPage, pages) => lastPage[lastPage.length - 1].id,
  });

  console.log({
    videosData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  });

  let title;
  if (ordering.by === "publishedAt") {
    if (ordering.order === "desc") {
      title = "Latest";
    } else if (ordering.order === "asc") {
      title = "Oldest";
    }
  } else if (ordering.by === "views") {
    if (ordering.order === "desc") {
      title = "Most Viewed";
    } else if (ordering.order === "asc") {
      title = "Least Viewed";
    }
  }

  let fullTitle =
    tagSlugs.length > 0
      ? `${title} videos about ${activeTags
          ?.map((tag) => tag.name)
          .join(" and ")}`
      : `${title} videos`;

  return (
    <section aria-label={fullTitle} className="w-full relative">
      <div
        className={cx(
          "sticky top-0 w-full gap-1 text-left sm:gap-3 bg-light dark:bg-lightBlack z-20 transition-opacity flex flex-col md:flex-row md:items-center md:justify-between px-3 lg:px-0 mb-5 py-5"
        )}
      >
        <div className={cx("flex flex-col", { "opacity-0": isLoading })}>
          <h1 className={cx("text-4xl md:text-5xl mt-0")}>{fullTitle}</h1>
          {/* <div className="text-sm font-semibold">
            <strong className={cx("font-extrabold")}>
              {videos?.length ?? 0}
            </strong>{" "}
            of{" "}
            <strong className={cx("font-extrabold")}>{totalVideosCount}</strong>{" "}
            Videos shown
          </div> */}
        </div>

        <div className="flex flex-row gap-1 sm:gap-10 justify-between lg:flex-row md:justify-end my-3 md:my-0 ">
          <ul className="flex flex-row">
            <li>
              <Link
                className={cx(
                  "border-twitchPurpleLight duration-400 transition-colors border border-r-0  betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-r-none",
                  ordering.by === "publishedAt"
                    ? "bg-twitchPurpleLight text-light"
                    : "bg-light dark:bg-lightBlack text-twitchPurpleLight"
                )}
                to={constructUrl({
                  ordering: { by: "publishedAt", order: ordering.order },
                })}
              >
                Date
              </Link>
            </li>
            <li>
              <Link
                className={cx(
                  "border-twitchPurpleLight duration-400 transition-colors border border-l-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-l-none",
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
            </li>
          </ul>
          <ul className="flex flex-row rounded-lg">
            <li>
              <Link
                className={cx(
                  "border-twitchPurpleLight duration-400 transition-colors border border-r-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-r-none",
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
            </li>
            <li>
              <Link
                className={cx(
                  "border-twitchPurpleLight duration-400 transition-colors border border-l-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-l-none",
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
            </li>
          </ul>
        </div>
      </div>

      <div className="relative lg:mx-[2px]">
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 xl:gap-12 2xl:gap-14 relative z-10">
          {videosData?.pages.map((page, pageIdx) => (
            <Fragment key={pageIdx}>
              {page.map((video, index) => (
                <li
                  style={{
                    animationDuration: `${Math.min(
                      300 + (index % 25) * 150,
                      1500
                    )}ms`,
                    animationName: "fadeIn",
                  }}
                  key={video.youtubeId}
                  className={cx("will-fade-scale transition-opacity", {
                    "opacity-0": isLoading,
                  })}
                >
                  <VideoGridItem video={video} lazy={index === 0} />
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
        {isLoading ? (
          <div
            style={{
              animationName: "fadeIn",
              animationDelay: "250ms",
              animationDuration: "500ms",
            }}
            className="flex absolute top-20 w-full justify-center opacity-0"
          >
            <LoadingSpinner />
          </div>
        ) : (
          <div className="w-full flex justify-center items-center my-10">
            {isFetchingNextPage ? (
              <LoadingSpinner />
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();

                  fetchNextPage();
                }}
                className="bg-twitchPurpleLight text-light text-center font-bold betterhover:hover:bg-twitchPurpleLight px-4 py-2 rounded inline-block saturate-50"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default VideosGrid;
