import type { Channel, Tag, TagVideo, Video } from "@prisma/client";
import VideoGridItem from "./video-grid-item";
import cx from "classnames";
import LoadingSpinner from "./loading-spinner";
import useUrlState from "~/hooks/use-url-state";
import useActionUrl from "~/hooks/use-action-url";
import { Link } from "@remix-run/react";

type VideoType = Video & {
  channel: Channel | null;
  tags: (TagVideo & {
    tag: Tag | null;
  })[];
};

type Props = {
  videos: VideoType[];
  title: string;
  totalVideosCount: number;
  handleLoadMore: (lastVideoId: number) => Promise<void>;
  loadMoreUrl: (lastVideoId: number) => string;
  loading?: boolean;
  loadingMore?: boolean;
};

const VideosGrid = ({
  videos,
  title,
  handleLoadMore,
  totalVideosCount,
  loading = false,
  loadingMore = false,
  loadMoreUrl,
}: Props) => {
  const { ordering } = useUrlState();
  const { constructUrl } = useActionUrl();
  const lastVideoId = videos.length > 0 ? videos[videos.length - 1].id : null;

  return (
    <section aria-label={title} className="w-full relative">
      <div
        className={cx(
          "sticky top-0 w-full gap-1 text-left sm:gap-3 bg-light dark:bg-lightBlack z-20 transition-opacity flex flex-col md:flex-row md:items-center md:justify-between px-3 lg:px-0 mb-5 py-5"
        )}
      >
        <div className={cx("flex flex-col", { "opacity-0": loading })}>
          <h1 className={cx("text-4xl md:text-5xl mt-0")}>{title}</h1>
          <div className="text-sm font-semibold">
            <strong className={cx("font-extrabold")}>
              {videos?.length ?? 0}
            </strong>{" "}
            of{" "}
            <strong className={cx("font-extrabold")}>{totalVideosCount}</strong>{" "}
            Videos shown
          </div>
        </div>

        <div className="flex flex-row gap-1 sm:gap-10 justify-between lg:flex-row md:justify-end my-3 md:my-0 ">
          <ul className="flex flex-row">
            <li>
              <Link
                className={cx(
                  "border-twitchPurpleLight duration-400 transition-colors border border-r-0  betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg text-sm sm:text-base rounded-r-none",
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
                  "border-twitchPurpleLight duration-400 transition-colors border border-l-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-l-none text-sm sm:text-base",
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
                  "border-twitchPurpleLight duration-400 transition-colors border border-r-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-r-none text-sm sm:text-base",
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
                  "border-twitchPurpleLight duration-400 transition-colors border border-l-0 betterhover:hover:bg-twitchPurpleLight betterhover:hover:text-light saturate-50 px-3 py-2 rounded-lg rounded-l-none text-sm sm:text-base",
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
          {videos
            ?.filter((video) => !video.disabled)
            .map((video, index) => (
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
                  "opacity-0": loading,
                })}
              >
                <VideoGridItem video={video} lazy={index === 0} />
              </li>
            ))}
        </ul>
        {loading ? (
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
            {totalVideosCount > videos?.length ? (
              loadingMore ? (
                <LoadingSpinner />
              ) : (
                <a
                  href={loadMoreUrl(lastVideoId ?? -1)}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();

                    handleLoadMore(lastVideoId ?? -1);
                  }}
                  className="bg-twitchPurpleLight text-light text-center font-bold betterhover:hover:bg-twitchPurpleLight px-4 py-2 rounded inline-block saturate-50"
                >
                  Load more
                </a>
              )
            ) : (
              <span>All done</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default VideosGrid;
