import type { Channel, Tag, TagVideo, Video } from "@prisma/client";
import Taglist from "./taglist";

const formatDate = (date: string | Date) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to compare just dates
  const resetTime = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dateOnly = resetTime(dateObj);
  const todayOnly = resetTime(today);
  const yesterdayOnly = resetTime(yesterday);

  const fullDate = dateObj.toLocaleDateString();

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return { display: "today", fullDate };
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return { display: "yesterday", fullDate };
  } else {
    return { display: fullDate, fullDate };
  }
};

const formatViewCount = (views: number) => {
  const formater = Intl.NumberFormat("en-US", { notation: "compact" });

  return formater.format(views);
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
      className="gap-5 h-full flex flex-col  group"
      key={video.youtubeId}
    >
      <div className="">
        <div className="aspect-video  relative shadow-md dark:shadow-slate-800 ">
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
          <li>
            {video.publishedAt &&
              (() => {
                const dateInfo = formatDate(video.publishedAt);
                return (
                  <span title={dateInfo.fullDate}>{dateInfo.display}</span>
                );
              })()}
          </li>
          <li>
            {video.views !== null && `${formatViewCount(video.views)} views`}
          </li>
        </ul>

        <a
          rel="noreferrer"
          target="_blank"
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
        >
          <h2 className="text-xl font-semibold flex-grow flex mt-1">
            {video.title}
          </h2>
        </a>

        <div className="flex flex-row space-x-3 items-center relative w-full">
          <a
            rel="noreferrer"
            target="_blank"
            className="flex flex-row items-center gap-x-3 w-full p-3 pl-0 overflow-clip"
            href={`https://www.youtube.com/channel/${video.channel?.youtubeId}`}
          >
            <img
              alt=""
              className="rounded-full"
              src={video.channel?.smallThumbnailUrl ?? ""}
              width={35}
              height={35}
              loading={lazy ? "lazy" : "eager"}
            />
            <h3 className="font-semibold overflow-clip w-max">
              {video.channel?.title}
            </h3>
          </a>
        </div>
      </div>

      <div className=" items-center ">
        <Taglist tags={video.tags.map((tag) => tag.tag as Tag)} />
      </div>
    </article>
  );
};

export default VideoGridItem;
