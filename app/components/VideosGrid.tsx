import type { Channel, Tag, TagVideo, Video } from "@prisma/client";
import VideoGridItem from "./VideoGridItem";
import cx from "classnames";
import LoadingSpinner from "./loadingSpinner";

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
  const lastVideoId = videos ? videos[videos.length - 1]?.id : null;

  return (
    <section aria-label={title} className="w-full lg:w-3/4 xl:w-4/5">
      <div
        className={cx(
          "sticky top-0 w-full gap-1 text-left sm:gap-3 bg-light dark:bg-lightBlack z-20 flex flex-col md:flex-row md:items-center lg:flex-col transition-opacity lg:items-start justify-between px-3 lg:px-0 mb-5 py-5",
          { "opacity-0": loading }
        )}
      >
        <h1 className={cx("text-4xl md:text-5xl mt-0")}>{title}</h1>
        <div className="text-sm font-semibold">
          <strong className={cx("font-extrabold")}>{videos.length}</strong> of{" "}
          <strong className={cx("font-extrabold")}>{totalVideosCount}</strong>{" "}
          Videos shown
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 relative z-10">
        {videos
          .filter((video) => !video.disabled)
          .map((video, index) =>
            loading ? null : (
              <li
                style={{
                  animationDuration: `${
                    index % 25 < 10
                      ? 250 + (index % 25) * 150
                      : 1500 + (index % 25) * 50
                  }ms`,
                  animationName: "fadeIn",
                }}
                key={video.youtubeId}
              >
                <VideoGridItem video={video} lazy={index === 0} />
              </li>
            )
          )}
      </ul>
      {loading ? (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="w-full flex justify-center items-center my-10">
          {totalVideosCount > videos.length ? (
            loadingMore ? (
              <LoadingSpinner />
            ) : (
              <a
                href={loadMoreUrl(lastVideoId ?? -1)}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();

                  handleLoadMore(lastVideoId ?? -1);
                }}
                className="bg-twitchPurpleLight text-light text-center font-bold betterhover:hover:bg-twitchPurple px-4 py-2 rounded inline-block saturate-50"
              >
                Load more
              </a>
            )
          ) : (
            <span>All done</span>
          )}
        </div>
      )}
    </section>
  );
};

export default VideosGrid;
