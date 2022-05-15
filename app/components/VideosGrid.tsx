import { Channel, Tag, TagVideo, Video } from '@prisma/client';
import VideoGridItem from './VideoGridItem';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import React, { Fragment, useState } from 'react';
import Filters, { TimeFilterOptions } from './filters';

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
  handleLoadMore: (e: React.MouseEvent<HTMLAnchorElement>) => Promise<void>;
  loading?: boolean;
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const gridElVariant = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
};

const VideosGrid = ({
  videos,
  title,
  handleLoadMore,
  totalVideosCount,
  loading = false,
}: Props) => {
  return (
    <section aria-label={title} className="w-full lg:w-3/4 xl:w-4/5">
      <div className="sticky top-0 w-full gap-1 text-left sm:gap-3 bg-white dark:bg-black z-20 flex flex-col md:flex-row md:items-center lg:flex-col lg:items-start justify-between px-3 lg:px-0 mb-5 py-5">
        <h1 className="text-4xl md:text-5xl mt-0">{title}</h1>
        <div className="text-sm font-semibold">
          <strong className="font-extrabold">{videos.length}</strong> of{' '}
          <strong className="font-extrabold">{totalVideosCount}</strong> Videos
          shown
        </div>
      </div>

      {loading ? (
        'Loading...'
      ) : (
        <>
          <motion.ul
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 relative z-10"
          >
            <AnimatePresence>
              {videos
                .filter((video) => !video.disabled)
                .map((video) => (
                  <Fragment key={video.youtubeId}>
                    <motion.li variants={gridElVariant} exit={{ opacity: 0 }}>
                      <VideoGridItem video={video} />
                    </motion.li>
                  </Fragment>
                ))}
            </AnimatePresence>
          </motion.ul>

          <div className="w-full flex justify-center items-center my-10">
            {totalVideosCount > videos.length ? (
              <a
                href="#"
                onClick={handleLoadMore}
                className="bg-twitchPurpleLight text-white text-center font-bold hover:bg-twitchPurple px-4 py-2 rounded inline-block"
              >
                Load more
              </a>
            ) : (
              <span>All done</span>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default VideosGrid;
