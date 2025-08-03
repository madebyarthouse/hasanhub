# Hasanhub

![Screenvideo of Hasanhub on desktop](https://github.com/user-attachments/assets/a539fd5d-7cf6-4ffc-a8f0-f6797aeebe74)

## Important Note

This is a raw release with some basic documentation.
There is currently no admin for editing the data. You'd need to insert the non-dynamic data directly via the database.

For more detailed documentation, please see the [README](./docs/README.md).

## What is this?

**Hasanhub project page:** [chrcit.com/projects/hasanhub-com](https://chrcit.com/projects/hasanhub-com)

A web app which aggregates videos from multiple Youtube Channels into one view.
If you add tags they will be autodetected on all videos synced.

## Why?

The political streamer Hasanabi allows his fans to clip his stream VODs, upload those clips to YouTube and make money from his content.
Due to this there are 100+ different YouTube channels dedicated to him. Some of these fan channels have over 200.000 subscribers.

His community is ideal for such an application due to the sheer number of channels.
But it could be useful for other creators/communites which have multiple channels and/or a larger backlog.

## Stack

- Typescript
- React
- Remix
- Prisma
- Turso / LibSQL
- Tailwind

I'm currently hosting via Vercel but it should work almost[1] everywhere.
Syncing needs to be setup via Cron jobs (or similiar) by hitting the API routes defined in the `vercel.json`

[1] Prisma limits support for edge enviromnents.

### Potential changes

- Add payloadcms
  - Also switches from Prisma to Drizzle
  - Add database configs for all available adapters
- Add deployment options for Docker and Vercel/Netlify/Cloudflare

## Can I use this for my own site?

For sure! If you do pls [let me know](https://twitter.com/chrcit) so I can check it out.
I'd also love a backlink to [my website](https://chrcit.com/projects/hasanhub-com?utm_source=github-hasanhub) somewhere on the site if you are awesome!
