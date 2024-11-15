# Technical Stack

## Core Technologies

- **Framework**: Remix.js
- **Language**: TypeScript
- **Database**: SQLite (via Prisma)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Key Dependencies

- **ORM**: Prisma
- **API Clients**:
  - youtube.ts for YouTube API
  - Custom clients for Twitch integration
- **Data Validation**: Zod
- **Analytics**: Plausible
- **Utilities**:
  - html-entities for decoding
  - iso8601-duration for parsing
  - classnames for CSS management

## Infrastructure

- Vercel for deployment and serverless functions
- Automated cron jobs for syncing
- Cache-Control headers for performance
