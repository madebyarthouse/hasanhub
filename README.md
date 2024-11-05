# Hasanhub
![CleanShot 2024-11-06 at 00 14 23](https://github.com/user-attachments/assets/7df9a391-b909-4606-9a6d-03bc49d6bd9e)


## Important Note 
This is a raw release with no real documentation and most importantly no admin for editing the data.
Right now you need to insert the non-dynamic data via the database.

## What is this?
**Hasanhub project page:** [chrcit.com/projects/hasanhub-com](https://chrcit.com/projects/hasanhub-com)

A web app which aggregates videos from multiple Youtube Channels into one view.
If you add tags they will be autodetected on all videos synced.

## Why?
The political streamer Hasanabi allows his fans to clip his stream VODs, upload those clips to YouTube and make money from his content.
Due to this there are 100+ different YouTube channels dedicated to him. Some of these fan channels have over 200.000 subscribers. 

His community is ideal for such an application due to the sheer number of channels.
But it could be useful for other creators/communites which have multiple channels and/or

## Stack
- Typescript
- React
- Remix
- Prisma
- Turso / LibSQL
- Tailwind

I'm currently hosting on Vercel but it should work.
Syncing needs to be setup via Cron jobs (or similiar) by hitting the API routes defined in the `vercel.json`

### Potential changes
- Add payloadcms
  - Also switches from Prisma to Drizzle
  - Add database configs for all available adapters
- Add deployment options for Docker and Vercel/Netlify/Cloudflare

## Can I use this for my own site?
For sure! If you do pls [let me know](https://twitter.com/chrcit) so I can check it out.
I'd also love a backlink to [my website](https://chrcit.com/projects/hasanhub-com?utm_source=github-hasanhub) somewhere on the site if you are awesome!

## Random stuff
## Refresh Twitch access token

```bash
curl -X POST 'https://id.twitch.tv/oauth2/token' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'client_id=ttsgjnui5mqji4aqjvzahh3mrlyzy3&client_secret=[CLIENT_SECRET]&grant_type=client_credentials'
```
