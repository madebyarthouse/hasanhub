# HasanHub (Cloudflare Worker + React Router)

This repository hosts a full-stack React Router application running on Cloudflare Workers with a D1 database.

## Stack

- React Router (SSR + data loaders)
- Cloudflare Workers (`wrangler`)
- Cloudflare D1 (`DB` binding)
- Cloudflare KV (`DB_QUERY_CACHE` binding)
- Drizzle ORM
- React + TypeScript

## Development

```bash
npm install
npm run dev
```

Local app is served in development mode at `http://localhost:5173`.

## Production build

```bash
npm run build
```

Run the generated server output:

```bash
npm run start
```

## Caching architecture

The project uses two read-cache layers:

- Worker response cache (Cache API + SWR logic in `workers/app.ts`) for HTTP responses.
- Query cache for hot DB reads in `app/lib/db-cache.server.ts` backed by Cloudflare KV and `cachified`.

### Query cache behavior

- Scope: only high-cardinality hot read paths are wrapped.
  - `getVideos` → `app/lib/get-videos.ts`
  - `getTagsForSidebar` → `db/queries/sidebar.ts`
  - `getActiveTagsBySlugs` → `app/lib/get-active-tags-by-slugs.ts`
  - `getStats` → `app/lib/get-stats.server.ts`
  - `getSitemapTagSlugs` → `app/lib/get-sitemap-tags.server.ts`
- TTL and stale-while-revalidate are derived from each route’s existing cache policy using `deriveDbCachePolicy` (`app/lib/db-cache.server.ts`).
- No explicit write-time invalidation is added yet; stale-while-revalidate + short TTLs are the invalidation model for now.

Key files:

- `app/lib/db-cache.server.ts`  
  - `deriveDbCachePolicy`
  - `createDbCacheKey`
  - `normalizeCacheValue`
  - `getCachedQuery` / `withDbCache`
- `workers/app.ts`  
  - Env now includes `DB_QUERY_CACHE: KVNamespace`.

## Cache policy wiring by route

Route-level cache policies are shared and passed into DB cache calls so response and DB TTL/SWR are aligned:

- `app/routes/__videos/index.tsx` (`getVideos`)
- `app/routes/__videos/tags/$splat.tsx` (`getVideos`, `getActiveTagsBySlugs`)
- `app/routes/__videos.tsx` (`getTagsForSidebar`)
- `app/routes/api/get-tags-for-sidebar.ts` (`getTagsForSidebar`)
- `app/routes/stats.tsx` (`getStats`)
- `app/routes/sitemap.xml.ts` (`getSitemapTagSlugs`)

## Cloudflare KV setup

`wrangler.jsonc` should include:

```jsonc
"kv_namespaces": [
  {
    "binding": "DB_QUERY_CACHE",
    "id": "<production-kv-id>",
    "preview_id": "<preview-kv-id>"
  }
]
```

Create/fetch namespace IDs in Cloudflare and update `wrangler.jsonc` accordingly.

Example provisioning:

```bash
# one-time (run in your Cloudflare account context)
wrangler kv namespace create DB_QUERY_CACHE
wrangler kv namespace create DB_QUERY_CACHE --preview
```

## DB query cache helpers

Use the dedicated helper pattern for hot reads:

1. parse/build stable cache args.
2. convert route policy to DB policy with `deriveDbCachePolicy`.
3. call `getCachedQuery({ key, cachePolicy, getFreshValue })`.

`createDbCacheKey` normalizes payloads before hashing to keep key generation stable across equivalent inputs.

## Commands

- `npm run typecheck` for type generation + `tsc`
- `npm run db:validate` for DB validation helper script

## Deployment notes

Build and deploy with Wrangler using your normal Cloudflare workflow (not included here). Ensure KV namespace IDs and D1 database binding are valid for each environment.
