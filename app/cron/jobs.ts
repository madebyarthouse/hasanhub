import { matchTags } from "./tasks/matchTags";
import { syncChannels } from "./tasks/syncChannels";
import { syncNewVideos } from "./tasks/syncNewVideos";
import { syncVideos } from "./tasks/syncVideos";

export type CronJob = "syncNewVideos" | "syncVideos" | "syncChannels" | "matchTags";

export const cronScheduleMap: Record<CronJob, string> = {
  syncNewVideos: "*/15 * * * *",
  syncVideos: "0 * * * *",
  syncChannels: "0 3 * * *",
  matchTags: "0 4 * * *",
};

const cronTaskMap: Record<CronJob, () => Promise<unknown>> = {
  syncNewVideos,
  syncVideos,
  syncChannels,
  matchTags,
};

export const runCronJob = async (job: CronJob) => {
  const task = cronTaskMap[job];
  return task();
};
