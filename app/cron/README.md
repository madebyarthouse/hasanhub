# Cron jobs

Cloudflare Cron Triggers are defined in `wrangler.jsonc`.

Current schedule mapping:
- `*/15 * * * *` → syncNewVideos
- `0 * * * *` → syncVideos
- `0 3 * * *` → syncChannels
- `0 4 * * *` → matchTags

Implementation note:
- The Worker `scheduled` handler calls `runCronJob` directly. No HTTP fetches are used for cron execution.
