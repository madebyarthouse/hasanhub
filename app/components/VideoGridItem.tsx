import { Channel, Tag, TagVideo, Video } from "@prisma/client";
import Taglist from "./Taglist";
import { motion } from "framer-motion";

const formatDate = (date: string | Date) => {
  if (typeof date === "string") {
    return new Date(date).toLocaleDateString();
  }

  return date.toLocaleDateString();
};

const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const hoursString = hours > 0 ? hours : "";
  const minutesString = hours > 0 ? `0${minutes}` : `${minutes}`;
  const secondsString = seconds > 9 ? `${seconds}` : `0${seconds}`;

  return [hoursString, minutesString, secondsString].filter(Boolean).join(":");
};

const VideoGridItem = ({
  video,
  layoutId,
}: {
  video: Video & { channel: Channel | null } & {
    tags: (TagVideo & {
      tag: Tag | null;
    })[];
  };
  layoutId?: string;
}) => {
  return (
    <motion.article
      layoutId={layoutId}
      className="gap-5 h-full flex flex-col justify-between"
      key={video.youtubeId}
    >
      <div className="px-3 lg:px-0">
        <div className="aspect-video relative group shadow-md dark:shadow-slate-800">
          <a
            rel="noreferrer"
            target="_blank"
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          >
            <img alt="" src={video.largeThumbnailUrl ?? ""} className="" />
            {video.duration && (
              <span className="bg-twitchPurpleLight group-hover:bg-opacity-90 text-sm bg-opacity-80 text-white absolute bottom-0 right-0 p-2">
                {formatDuration(video.duration)}
              </span>
            )}
          </a>
        </div>

        <div className="flex flex-row space-x-3 items-center relative w-full">
          <div className=" flex flex-row space-x-3 items-center p-3 pl-0 overflow-clip">
            <img
              alt={video.channel?.title}
              className="rounded-full"
              src={video.channel?.mediumThumbnailUrl ?? ""}
              width={32}
              height={32}
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

          <div className="text-sm absolute right-0 bg-white dark:bg-black p-1 pr-0">
            {video.publishedAt && formatDate(video.publishedAt)}
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
    </motion.article>
  );
};

export default VideoGridItem;
