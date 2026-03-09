import { desc, eq } from "drizzle-orm";
import { matchTagWithVideos } from "~/sync/services/matching";
import { chunkByParams } from "~/utils";
import { Tag, TagVideo, Video } from "../../../db/schema";
import { db } from "../../../db/client";
import type { ReturnTypeOrDb } from "../../../db/queries/types";

const fetchVideosChunked = async (
  dbClient: ReturnTypeOrDb,
  take: number,
  chunkSize: number
) => {
  const videos = [] as Array<{
    id: number;
    title: string;
    publishedAt: string | null;
    createdAt: string;
  }>;

  for (let i = 0; i < take; i += chunkSize) {
    const chunk = await dbClient
      .select({
        id: Video.id,
        title: Video.title,
        publishedAt: Video.publishedAt,
        createdAt: Video.createdAt,
      })
      .from(Video)
      .orderBy(desc(Video.createdAt))
      .limit(chunkSize)
      .offset(i);

    videos.push(...chunk);

    if (chunk.length < chunkSize) {
      break;
    }
  }

  return videos;
};

export const matchTags = async () => {
  const [tags, videos] = await Promise.all([
    db.select().from(Tag),
    fetchVideosChunked(db, 100000, 5000),
  ]);

  const taggedVideos: { [key: string]: number } = {};
  let insertedTagVideos = 0;

  for (const tag of tags) {
    const tagVideos = await db
      .select({ videoId: TagVideo.videoId })
      .from(TagVideo)
      .where(eq(TagVideo.tagId, tag.id));

    const existingVideoIds = tagVideos
      .map((row) => row.videoId)
      .filter(Boolean) as number[];

    const filteredVideos = videos.filter((video) => {
      if (tag.lastedMatchedAt === null || video.publishedAt === null) {
        return true;
      }

      const lastMatchedUtc = new Date(tag.lastedMatchedAt).toISOString();
      const videoCreatedUtc = new Date(video.createdAt).toISOString();

      return videoCreatedUtc >= lastMatchedUtc;
    });

    const matchedVideos = matchTagWithVideos(tag, filteredVideos as any);
    taggedVideos[tag.name] = matchedVideos.length;

    const newTagVideos = matchedVideos.filter(
      (matchedVideo) => !existingVideoIds.includes(matchedVideo.id)
    );

    if (newTagVideos.length > 0) {
      const tagVideoRows = newTagVideos.map((matchedVideo) => ({
        tagId: tag.id,
        videoId: matchedVideo.id,
      }));
      const tagVideoChunks = chunkByParams(tagVideoRows);
      for (const chunk of tagVideoChunks) {
        await db.insert(TagVideo).values(chunk).onConflictDoNothing();
      }
      insertedTagVideos += newTagVideos.length;
    }

    await db
      .update(Tag)
      .set({ lastedMatchedAt: new Date().toISOString() })
      .where(eq(Tag.id, tag.id));
  }

  console.log("matchTags:inserted", {
    tagCount: tags.length,
    videoCount: videos.length,
    newTagVideoCount: insertedTagVideos,
  });

  return {
    tagCount: tags.length,
    videoCount: videos.length,
    newTagVideoCount: insertedTagVideos,
  };
};
