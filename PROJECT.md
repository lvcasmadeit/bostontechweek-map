# Project: Boston Tech Week 2026 Interactive Map

## Current-State Snapshot

- Initialized: 2026-04-28
- Phase: MVP hardening, map-first overlay refactor, and mobile usability polish
- App status: implemented and production-buildable
- Verification: `npm run lint` and `npm run build` pass
- Stack: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Mapbox via `react-map-gl`
- Data model: static `src/data/events.json` plus `src/data/filters.json`

## Implementation Audit

The repository is beyond setup and already delivers the core event discovery experience.

Implemented today:

- Interactive Boston/Cambridge map with clustered markers
- Map and list view toggle
- Date browsing for May 26-31, 2026
- Multi-select filters for topics, neighborhoods, types, and start-time buckets
- Text search across event metadata
- Saved lineup backed by local storage
- Event selection synced between list and map
- Responsive full-screen map layout with mobile filter and list overlays
- Graceful non-map fallback when a local map token is not configured

Primary implementation files:

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `src/components/BostonTechWeekApp.tsx`
- `src/components/EventFilters.tsx`
- `src/components/EventCard.tsx`
- `src/components/map/MapView.tsx`
- `src/lib/security.ts`
- `src/data/events.json`
- `src/data/filters.json`

## What Changed Since The Original Plan

The older version of this project document described a repo that had not yet been scaffolded. That is no longer accurate.

Outdated assumptions from the original plan:

- The project is not in planning/setup anymore
- The scaffold already exists
- The data work is beyond just having `filters.json`

Accurate framing now:

- The product exists as a working prototype
- The main work is refinement, cleanup, validation, and safe iteration

## Known Gaps

### Product / UX

- The filter panel includes a “featured events only” toggle that is currently not wired into filtering behavior
- The full-screen map overlay refactor is underway and remains a key coordination point across UI, cleanup, and QA work
- Mobile still needs focused usability work around small-screen overlay stacking, touch ergonomics, and viewport-space management when filters, list view, and map controls compete for space
- The current mobile experience appears functional, but it has not yet been backed by targeted regression coverage across key breakpoints and saved-lineup flows

### Codebase

- `src/components/EventMap.tsx` appears to be a legacy component and is not the active map path
- There are no automated tests or browser regression checks in the repo yet
- Mobile behavior is concentrated in `src/components/BostonTechWeekApp.tsx`, `src/components/EventFilters.tsx`, `src/components/EventCard.tsx`, and `src/components/map/MapView.tsx`

### Data

- Event data is static and not yet backed by a documented refresh pipeline
- Current event data does not include `endTime` for any of the `573` events
- `89` events are missing `registrationUrl`
- `8` registration URLs are reused across multiple events and should be reviewed as part of future cleanup
- `src/data/README.md` now documents the data contract and the `npm run data:sync-filters` / `npm run data:validate` workflow

## Priority Roadmap

### P0

- Keep repository docs aligned with the live implementation
- Implement the full-screen overlay map refactor without breaking existing behavior
- Improve mobile usability without regressing desktop map-first behavior

### P1

- Formalize data validation and refresh workflows
- Add automated tests and CI around key product flows, especially mobile overlays, filters, and saved-lineup behavior

### P2

- Improve shareability, metadata polish, launch QA, and post-MVP enhancements

## Specialist Coordination

Detailed specialist role definitions and handoff guidance now live in `AGENTS.md`.

Current coordination notes:

- Mobile improvement work should preserve the current visual language and focus on layout behavior, touch interaction, and clear state transitions between map, filters, dates, and list panels
- Frontend cleanup, data pipeline work, documentation maintenance, and QA automation should use `AGENTS.md` as the execution brief
- Data validation now exists, but `endTime`, `registrationState`, and any future `featured` or `status` fields still need product and data-source coordination before they should be enforced in CI
