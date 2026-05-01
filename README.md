# Boston Tech Week 2026 Interactive Map

An interactive event discovery app for Boston Tech Week 2026. The current product is a static-data Next.js app with a Mapbox-powered map, synchronized list view, filtering, search, and a saved lineup flow.

## Current State

- Status: working prototype / MVP implementation in progress
- Framework: Next.js 15 + React 19 + TypeScript
- Styling: Tailwind CSS 4
- Map: Mapbox GL via `react-map-gl`
- Data source: static `src/data/events.json` and `src/data/filters.json`
- Current verification: `npm run lint` and `npm run build` pass

This repository is no longer just a scaffold. The core app already exists in:

- `app/page.tsx`
- `src/components/BostonTechWeekApp.tsx`
- `src/components/EventFilters.tsx`
- `src/components/EventCard.tsx`
- `src/components/map/MapView.tsx`

## Implemented Features

- Interactive Boston/Cambridge map with clustered event markers
- Map view and list view toggle
- Date filtering for May 26-31, 2026
- Multi-select filters for topics, neighborhoods, types, and start-time buckets
- Text search across title, host, description, venue, neighborhood, type, and topics
- Map/list synchronization when selecting events
- Saved lineup backed by local storage
- Safe external registration link handling
- Graceful list-first fallback when `NEXT_PUBLIC_MAPBOX_TOKEN` is missing

## Known Gaps

- `README.md` and `PROJECT.md` were previously behind the actual implementation; this update corrects that
- The filter panel includes a “featured events only” toggle that is currently UI-only and not wired into filtering
- `src/components/EventMap.tsx` appears to be a legacy map component and is not the active implementation
- There are no automated tests in the repo yet
- Event data is static and not yet backed by a repeatable refresh pipeline
- All current events are missing `endTime`, and some are missing `registrationUrl`

## Getting Started

Install dependencies if needed:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment

Set a public Mapbox token locally if you want the live map enabled:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
```

You can place that in `.env.local`. If the token is missing, the app intentionally keeps the event list available and hides the live map experience.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Data Model

Event records live in `src/data/events.json` and follow `src/types/events.ts`.

Important fields:

- `id`
- `title`
- `startTime`
- `neighborhood`
- `venue`
- `address`
- `lat`
- `lng`
- `topics`
- `type`
- `host`
- `description`
- `registrationUrl`
- `isFree`
- `isInviteOnly`

Filter options live in `src/data/filters.json`.

## Security Notes

- Registration links are sanitized before rendering and only `https:` URLs are allowed
- Security headers are configured in `next.config.ts`
- The app does not ship a fallback Mapbox token in source

## Project Structure

```text
app/
src/
  components/
  data/
  lib/
  types/
```

## Next Steps

The project is now in a “tighten, validate, and refactor” phase rather than a “create the scaffold” phase.

### UI/UX Agent Prompt

Refactor the app so the map becomes the primary full-screen canvas and navigation/menus overlay on top of it, while preserving existing functionality. Keep the current visual language and menu styling unless overlaying them on the map creates a clear usability issue, in which case make the smallest design changes needed to maintain readability, hierarchy, and tap/click usability.

Scope:

- Make the map fill the available screen space as the main background canvas
- Convert the existing filter/list control surfaces into overlays on top of the map
- Add hide/show behavior for overlay menus, including a visible `-` hide button
- Add a clean navigation bar that matches the current menu/application styling
- Include nav actions for map view with a globe icon, list view with a bullet list icon, and favorites with a star icon
- Favorites should map to the current saved lineup behavior, not introduce a new persistence model
- Preserve all existing functional behavior: filters, search, date tabs, saved lineup, event selection, map/list sync, mobile filter sheet intent, and graceful no-token fallback
- Do not regress accessibility or mobile usability

Deliverables:

- Updated layout and interaction model
- Responsive behavior for desktop and mobile
- Clear notes on any UX tradeoffs made
- No functionality regressions

Primary files to inspect first:

- `src/components/BostonTechWeekApp.tsx`
- `src/components/EventFilters.tsx`
- `src/components/EventCard.tsx`
- `src/components/map/MapView.tsx`
- `app/globals.css`

### Other Agent Handoff Prompts

Documentation / PM Agent:

Audit the repository docs against the current implementation and keep `README.md` and `PROJECT.md` accurate as the product evolves. Maintain a current-state snapshot, known gaps, and an execution-ready roadmap for specialists.

Data Pipeline Agent:

Validate `src/data/events.json` and `src/data/filters.json`, define a reproducible refresh/validation workflow, and propose any schema additions needed for future product features such as featured events or richer schedule metadata.

QA / Release Agent:

Add automated coverage for filter behavior, saved lineup persistence, map token fallback behavior, and registration URL sanitization. Wire those checks into CI so future refactors have a regression safety net.
