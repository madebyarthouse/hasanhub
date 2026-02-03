# Cron jobs

Cloudflare Cron Triggers are defined in `wrangler.toml`.

Current schedule mapping:
- `*/15 * * * *` → syncNewVideos
- `0 * * * *` → syncVideos
- `0 3 * * *` → syncChannels
- `0 4 * * *` → matchTags

Implementation note:
- React Router v7 framework mode doesn’t yet expose a built-in scheduled handler here. We’ll wire the Worker `scheduled` handler to call `runCronJob` for each schedule in the Worker entry once the Cloudflare adapter is configured.

Env needed:
- `CRON_ORIGIN` (base URL for cron fetches, default `https://hasanhub.com`)
