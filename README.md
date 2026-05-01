# Boston Tech Week 2026 Interactive Map

A map-first event discovery experience for Boston Tech Week 2026.

This project helps attendees explore events happening across Boston and Cambridge during Boston Tech Week, browse the schedule visually, filter by interest, and save a personal lineup.

## What It Does

- Shows Boston Tech Week events on an interactive map
- Lets you switch between map and list views
- Supports filtering by date, topic, neighborhood, event type, and time of day
- Includes search across event information
- Lets you save favorite events into a personal lineup
- Works on desktop and mobile

## Current Status

The app is already implemented as a working prototype and includes the core event discovery flow. The current focus is refinement, polish, and improving release readiness.

## Experience Highlights

- Clustered event markers across Boston and Cambridge
- Synchronized map and event list behavior
- Quick search and multi-select filtering
- Day-by-day browsing for May 26-31, 2026
- Saved lineup that persists in the browser

## Known Limitations

- Some event metadata is still being cleaned up and enriched
- The current dataset is maintained statically
- The interface is actively being refined for a stronger map-first experience

## Running Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

To enable the live map in local development, provide a valid public map token in your local environment configuration.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Mapbox via `react-map-gl`

## Roadmap

Near-term priorities:

- Evolve the layout toward a more immersive full-screen map experience
- Improve data quality and refresh workflows
- Add automated regression coverage
- Continue polishing mobile and accessibility behavior

Detailed implementation planning and specialist handoff notes live in `PROJECT.md`.
