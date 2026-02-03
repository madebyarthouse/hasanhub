export type CronJob = "syncNewVideos" | "syncVideos" | "syncChannels" | "matchTags";

export const cronScheduleMap: Record<CronJob, string> = {
  syncNewVideos: "*/15 * * * *",
  syncVideos: "0 * * * *",
  syncChannels: "0 3 * * *",
  matchTags: "0 4 * * *",
};

export const cronEndpoints: Record<CronJob, string> = {
  syncNewVideos: "/api/syncNewVideos",
  syncVideos: "/api/syncVideos",
  syncChannels: "/api/syncChannels",
  matchTags: "/api/matchTags",
};

export const runCronJob = async (job: CronJob, origin: string) => {
  const endpoint = cronEndpoints[job];
  const url = `${origin}${endpoint}`;

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cron job ${job} failed: ${response.status} ${text}`);
  }

  return response.json();
};

export const getCronOrigin = (env: { CRON_ORIGIN?: string }) => {
  return env?.CRON_ORIGIN ?? "https://hasanhub.com";
};
