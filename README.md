# HasanHub

![HasanHub preview](./hasanhub-screenvideo.gif)

HasanHub is a web app that aggregates videos from multiple YouTube channels into one view. Tags can be added centrally and are then auto-detected across synced videos.

The original project launched in April 2022 and is documented here: [chrcit.com/projects/hasanhub-com](https://www.chrcit.com/projects/hasanhub-com)

> This is still a raw release with basic documentation.
> There is currently no admin UI for editing data.
> Non-dynamic data needs to be inserted directly into the database.

## What Is This?

HasanHub is a YouTube aggregator for the Hasanabi Clips Industrial Complex.

Political streamer [Hasanabi](https://www.twitch.tv/hasanabi) allows fans to clip stream VODs, upload those clips to YouTube, and build fan channels around them. Over time this created a large ecosystem of Hasan-related channels. HasanHub pulls videos from those channels into a single feed so users can browse clips across the whole network instead of hopping between individual channels.

## Why?

Hasan's community is a particularly good fit for this kind of product because there are so many fan channels and so much backlog spread across them.

But the idea is broader than Hasanabi. This setup can also work for other creators or communities that have:

- multiple affiliated channels
- a fragmented video archive
- a need for unified discovery, tagging, and filtering

## Features

- Aggregate videos from many channels into one feed
- Filter by tags, duration, timeframe, and ordering
- Auto-match tags against synced videos
- Show sidebar tag discovery based on views
- Expose Twitch stream status and schedule data
- Publish stats and sitemap routes
- Run scheduled sync jobs for channels, videos, and tag matching

## Stack

Frontend:

- TypeScript
- React 19
- React Router 7 with SSR
- Tailwind CSS v4

Backend:

- Cloudflare Workers
- Cloudflare D1 (SQLite) with Drizzle ORM
- Cloudflare KV for hot-query caching
- Worker Cache API for response-level SWR caching
- YouTube and Twitch integrations

Tooling:

- `pnpm`
- Wrangler
- Drizzle Kit
- Vite

## Development

```bash
pnpm install
pnpm dev
```

The local dev server runs at `http://localhost:5173`.

Other useful commands:

```bash
pnpm build
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:remote
pnpm db:validate
pnpm db:studio
```

## Configuration

This app is configured as a Cloudflare Worker in [wrangler.jsonc](/Users/chrcit/Developer/hasanhub/wrangler.jsonc).

Important bindings and environment values:

- `DB`: Cloudflare D1 database
- `DB_QUERY_CACHE`: Cloudflare KV namespace for Drizzle read caching
- `YOUTUBE_API_KEY`: YouTube sync client
- `TWITCH_CLIENT_ID`: Twitch API client ID
- `TWITCH_CLIENT_SECRET`: Twitch API client secret
- `TOP_OF_THE_HOUR_SECRET`: secret for the rating endpoint
- `CLOUDFLARE_ACCOUNT_ID`: required by Drizzle Kit
- `CLOUDFLARE_D1_ID`: required by Drizzle Kit
- `CLOUDFLARE_TOKEN`: required by Drizzle Kit

## Data Model And Editing

There is no admin panel yet.

That means operational data like channels, tags, and other non-dynamic records need to be managed directly in D1. Synced data such as videos and channel metadata is then refreshed through the app's sync tasks.

Relevant schema lives in [db/schema.ts](/Users/chrcit/Developer/hasanhub/db/schema.ts).

## Sync Jobs

The worker has scheduled jobs defined in [app/cron/jobs.ts](/Users/chrcit/Developer/hasanhub/app/cron/jobs.ts):

- `syncNewVideos`: every 15 minutes
- `syncVideos`: every hour
- `syncChannels`: daily at 03:00
- `matchTags`: daily at 04:00

These jobs keep the dataset current and apply tag matching after sync.

## Caching

HasanHub currently uses two cache layers:

- Worker-level response caching with stale-while-revalidate behavior in [workers/app.ts](/Users/chrcit/Developer/hasanhub/workers/app.ts)
- KV-backed query caching for hot Drizzle read paths in [app/lib/db-cache.server.ts](/Users/chrcit/Developer/hasanhub/app/lib/db-cache.server.ts)

The query cache is currently used for high-traffic read paths like:

- videos feed queries
- sidebar tag queries
- active tag lookup by slug
- stats queries
- sitemap tag queries

## Database Scripts

There are helper scripts for local and remote D1 workflows:

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:migrate:remote`
- `pnpm db:import:remote-to-local`
- `pnpm db:import:local-to-remote`
