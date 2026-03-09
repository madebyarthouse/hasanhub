import type {
  Channel,
  Tag,
  TagVideo,
  Video,
} from "./schema";

export type ChannelRecord = typeof Channel.$inferSelect;
export type VideoRecord = typeof Video.$inferSelect;
export type TagRecord = typeof Tag.$inferSelect;
export type TagSidebarRecord = Pick<TagRecord, "id" | "name" | "slug"> & {
  viewsCount?: number;
};
export type TagVideoRecord = typeof TagVideo.$inferSelect;
