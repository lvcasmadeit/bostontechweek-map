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

The app is implemented as a working prototype and includes the core event discovery flow. Event data is fetched from the official Tech Week calendar at build/request time, normalized for the map experience, and backed by a local fallback dataset. The current focus is refinement, data quality, polish, and release readiness.

## Experience Highlights

- Clustered event markers across Boston and Cambridge
- Synchronized map and event list behavior
- Quick search and multi-select filtering
- Day-by-day browsing for May 26-31, 2026
- Saved lineup that persists in the browser

## Known Limitations

- Some event metadata from the official calendar is still incomplete for map precision and rich descriptions
- Map coordinates are currently neighborhood-level approximations with deterministic marker spread
- `src/data/events.json` remains as a fallback dataset rather than the primary live source
- The interface is actively being refined for a stronger map-first experience

## Running Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

To enable the live map in local development, provide `NEXT_PUBLIC_MAPBOX_TOKEN` in your local environment configuration.

The app fetches Boston events from the official Tech Week calendar through `src/lib/tech-week-events.ts`. `src/data/events.json` is still used as a fallback if the remote calendar request fails, and `src/data/filters.json` remains the static filter vocabulary used by the UI.

If you update fallback data, run `npm run data:sync-filters` and then `npm run data:validate`.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Mapbox via `react-map-gl`

## Roadmap

Near-term priorities:

- Evolve the layout toward a more immersive full-screen map experience
- Improve mobile usability for map, filters, and saved-lineup flows
- Improve venue-level map precision and event metadata enrichment
- Add automated regression coverage
- Continue polishing mobile and accessibility behavior

Detailed implementation planning and specialist handoff notes live in `PROJECT.md`.
