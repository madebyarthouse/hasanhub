# Synchronization System

## Overview

HasanHub implements a sophisticated synchronization system to aggregate and categorize YouTube content through multiple coordinated processes.

## Core Sync Components

### 1. Channel Sync (`/api/syncChannels`)

- **Purpose**: Maintains channel metadata and health
- **Frequency**: Hourly via Vercel cron
- **Process**:
  1. Fetches all configured channels
  2. Updates metadata (title, description, thumbnails)
  3. Marks channels as published/unpublished
  4. Handles batch processing for API limits

### 2. Video Sync (`/api/syncVideos`, `/api/syncNewVideos`)

- **Purpose**: Discovers and updates video content
- **Implementation**:
  - RSS feeds for quick new video detection
  - YouTube API for detailed metadata
  - Pagination handling for large channels
- **Update Schedule**:
  - New videos: Every 15 minutes
  - Recent videos (< 1 day): Every 4 hours
  - Older videos: Decreasing frequency

### 3. Tag Matching System (`/api/matchTags`)

- **Purpose**: Automated content categorization
- **Features**:
  - Pattern-based title matching
  - Synonym support
  - Multi-word tag matching
- **Process**:
  ```typescript
  // Simplified tag matching logic
  const matchTagWithVideos = (tag: Tag, videos: Video[]) => {
    const synonyms = tag.synonyms.split(",");
    return videos.filter((video) =>
      synonyms.some((synonym) => sanitizeTitle(video.title).includes(synonym))
    );
  };
  ```
