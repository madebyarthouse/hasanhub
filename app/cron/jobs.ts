export type CronJob = "syncNewVideos" | "syncVideos" | "syncChannels" | "matchTags";

export const cronScheduleMap: Record<CronJob, string> = {
  syncNewVideos: "*/15 * * * *",
  syncVideos: "0 * * * *",
  syncChannels: "0 3 * * *",
  matchTags: "0 4 * * *",
};

export const runCronJob = async (job: CronJob) => {
  switch (job) {
    case "syncNewVideos": {
      const { syncNewVideos } = await import("./tasks/syncNewVideos");
      return syncNewVideos();
    }
    case "syncVideos": {
      const { syncVideos } = await import("./tasks/syncVideos");
      return syncVideos();
    }
    case "syncChannels": {
      const { syncChannels } = await import("./tasks/syncChannels");
      return syncChannels();
    }
    case "matchTags": {
      const { matchTags } = await import("./tasks/matchTags");
      return matchTags();
    }
    default: {
      const _exhaustive: never = job;
      throw new Error(`Unknown cron job: ${_exhaustive}`);
    }
  }
};
