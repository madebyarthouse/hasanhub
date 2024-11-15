# Frontend Architecture

## Core Components

### Layout Components

- Root Layout: Global app wrapper with stream status and analytics
- Videos Layout: Main content area with sidebar and grid
- Sidebar: Tag navigation and filtering
- Header: Stream status and branding

### Video Components

- VideoGrid: Main content display with infinite scroll
- VideoCard: Individual video preview with metadata
- TagList: Scrolling tag list per video

## State Management

### URL-Based State

- Tag filtering via URL path `/tags/[tag1]/[tag2]`
- Sort order via query params `?order=desc&by=views`
- Duration filters via query params `?durations=short,medium`
- Pagination via cursor `?lastVideoId=123`

### Data Flow

- Server-side data loading via Remix loaders
- Client-side state management through URL
- Optimistic updates for UI interactions
- Cursor-based pagination for infinite scroll

## Data Loading Patterns

### Videos Loading

- Cursor-based pagination for efficient loading
- Batch size of 25 videos per request
- Multiple filter combinations (tags, duration, date)
- View count and publish date sorting

### Tags Loading

- Loaded once at route level
- Includes video counts per tag
- Cached aggressively (24 hours)
- Used for sidebar navigation

## Performance Features

### Caching

- Route-level cache headers
- Stale-while-revalidate strategy
- Long-term caching for static assets
- Short-term caching for video data

### Loading States

- Skeleton loaders during data fetch
- Optimistic UI updates
- Progressive enhancement
- Error boundaries for failures

### Optimization

- Lazy loading images
- Chunked data transfer
- Prefetching next data set
- Responsive image sizing
