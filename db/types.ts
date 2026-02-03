import type {
  Channel,
  Playlist,
  Tag,
  TagVideo,
  TopOfTheHourRating,
  TwitchAuth,
  Video,
} from "./schema";

export type ChannelRecord = typeof Channel.$inferSelect;
export type PlaylistRecord = typeof Playlist.$inferSelect;
export type VideoRecord = typeof Video.$inferSelect;
export type TagRecord = typeof Tag.$inferSelect;
export type TagSidebarRecord = Pick<TagRecord, "id" | "name" | "slug"> & {
  viewsCount?: number;
};
export type TagVideoRecord = typeof TagVideo.$inferSelect;
export type TopOfTheHourRatingRecord = typeof TopOfTheHourRating.$inferSelect;
export type TwitchAuthRecord = typeof TwitchAuth.$inferSelect;
