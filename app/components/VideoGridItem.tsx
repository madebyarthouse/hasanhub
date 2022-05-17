import type { Channel, Tag, TagVideo, Video } from "@prisma/client";
import Taglist from "./Taglist";

const formatDate = (date: string | Date) => {
  if (typeof date === "string") {
    return new Date(date).toLocaleDateString();
  }

  return date.toLocaleDateString();
};

const formatViewCount = (views: number) => {
  if (views < 1000) {
    return views;
  } else if (views < 1000000) {
    const thousands = Math.floor(views / 1000);
    const hundreds = Math.floor((views % 1000) / 100);
    return `${thousands}.${hundreds}k`;
  } else {
    const millions = Math.floor(views / 1000000);
    const thousands = Math.floor((views % 1000000) / 10000);

    return `${millions}.${thousands}m`;
  }
};

const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const hoursString = hours > 0 ? hours : "";
  const minutesString =
    hours > 0 && minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsString = seconds > 9 ? `${seconds}` : `0${seconds}`;

  return [hoursString, minutesString, secondsString].filter(Boolean).join(":");
};

const VideoGridItem = ({
  video,
  layoutId,
  lazy = false,
}: {
  video: Video & { channel: Channel | null } & {
    tags: (TagVideo & {
      tag: Tag | null;
    })[];
  };
  lazy?: boolean;
  layoutId?: string;
}) => {
  return (
    <article
      className="gap-5 h-full flex flex-col justify-between betterhover:hover:scale-[1.02] transition-transform group"
      key={video.youtubeId}
    >
      <div className="px-3 lg:px-0">
        <div className="aspect-video relative shadow-md dark:shadow-slate-800 ">
          <a
            rel="noreferrer"
            target="_blank"
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          >
            <img
              className="w-full h-full object-cover"
              loading={lazy ? "lazy" : "eager"}
              alt={`Thumbnail for ${video.title}`}
              src={video.largeThumbnailUrl ?? ""}
            />
            {video.duration && (
              <div className="bg-lightBlack group-hover:bg-opacity-90 text-sm bg-opacity-80 text-light absolute bottom-1 right-1 px-2 py-1">
                {formatDuration(video.duration)}
              </div>
            )}
          </a>
        </div>

        <ul className="flex flex-row justify-between py-2 items-center w-full text-sm">
          <li>{video.publishedAt && formatDate(video.publishedAt)}</li>
          <li>{formatViewCount(video.views ?? 0)} views</li>
        </ul>

        <div className="flex flex-row space-x-3 items-center relative w-full">
          <div className="flex flex-row items-center gap-x-3 p-3 pl-0 overflow-clip">
            <img
              alt={video.channel?.title}
              className="rounded-full"
              src={video.channel?.mediumThumbnailUrl ?? ""}
              width={32}
              height={32}
              loading={lazy ? "lazy" : "eager"}
            />
            <a
              rel="noreferrer"
              target="_blank"
              className="inline-block overflow-hidden"
              href={`https://www.youtube.com/channel/${video.channel?.youtubeId}`}
            >
              <h3 className="text-sm font-semibold overflow-clip w-max">
                {video.channel?.title}
              </h3>
            </a>
          </div>
        </div>

        <a
          rel="noreferrer"
          target="_blank"
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
        >
          <h2 className="text-xl font-semibold flex-grow flex">
            {video.title}
          </h2>
        </a>
      </div>

      <div className=" items-center ">
        <Taglist tags={video.tags.map((tag) => tag.tag as Tag)} />
      </div>
    </article>
  );
};

export default VideoGridItem;
