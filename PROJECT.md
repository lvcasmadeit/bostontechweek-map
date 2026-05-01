# Project: Boston Tech Week 2026 Interactive Map

## Status Snapshot

- Initialized: 2026-04-28
- Current phase: MVP hardening and product refactor planning
- Scaffold status: complete
- App status: implemented and building successfully
- Verification status: `npm run lint` and `npm run build` pass
- Data status: static `events.json` and `filters.json` are in active use by the app

## What Exists Today

The current application already delivers most of the originally planned MVP:

- Interactive Mapbox map centered on Boston/Cambridge
- Clustered markers with event popup interactions
- Sidebar filter experience with multi-select controls
- Search across event metadata
- Date switching for May 26-31
- Map view and list view toggle
- Saved lineup flow using local storage
- Responsive behavior with a mobile filter sheet
- Safe registration link rendering and baseline security headers

## Core App Files

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

## Original Plan vs Current Reality

The original plan assumed the project was still in setup, but the repository has moved well past that point.

No longer accurate from the previous version of this file:

- “Planning & Setup” as the main phase
- “Scaffold: Not yet created”
- “filters.json ready” as the main data milestone

Accurate current framing:

- The app exists and works
- The main needs are product refinement, codebase cleanup, data quality, and release confidence

## Product Goals

### Primary Goals

- Make event discovery feel immediate and spatial
- Keep map and list views tightly synchronized
- Preserve fast filtering across hundreds of events
- Deliver a polished mobile and desktop experience
- Keep the app reliable even without a Mapbox token

### Nice-to-Haves After MVP Hardening

- Automated data refresh pipeline
- Sharable URLs for filters and saved state
- Calendar export
- Smarter recommendations

### Non-Goals

- Full backend/auth system for MVP
- Real-time RSVP management

## Current Risks and Gaps

### Product / UX

- The “featured events only” toggle exists in the UI but is not connected to app state or data
- The current layout is strong, but the next major product change is a map-first full-screen overlay model

### Codebase

- `src/components/EventMap.tsx` appears to be a legacy component and is not the active map implementation
- There are no automated tests

### Data

- Data is static and not backed by a documented refresh pipeline
- All current events are missing `endTime`
- Some events are missing `registrationUrl`

## Priority Order

### P0

- Align repo docs with the actual implementation and active roadmap
- Resolve the dead-end “featured” product affordance
- Plan and implement the full-screen overlay map refactor without breaking current behavior

### P1

- Formalize data validation and refresh workflows
- Add automated tests and CI coverage around key product behavior

### P2

- Sharable state, metadata polish, launch QA, and post-MVP enhancements

## Next Steps

### 1. UI/UX Agent Prompt

You are the UI/UX + frontend refactor owner for the Boston Tech Week 2026 map application. Your job is to redesign the layout so the map becomes the dominant full-screen canvas and the app controls overlay on top of it, while preserving all current functionality and the existing visual identity wherever possible.

Context:

- The current app is implemented in `src/components/BostonTechWeekApp.tsx`, `src/components/EventFilters.tsx`, `src/components/EventCard.tsx`, and `src/components/map/MapView.tsx`
- The current styling direction is a dark, neon-accented, control-panel aesthetic that should be preserved unless overlaying those controls on top of the map creates a clear UX problem
- The app already supports filters, search, date tabs, list/map switching, event selection, map/list synchronization, and a saved lineup backed by local storage

Refactor requirements:

- Make the map take up the entire primary screen space
- Overlay the menus and controls on top of the map
- Keep menu styles and design substantially the same unless overlay placement creates readability, hierarchy, or usability issues
- All major menus must be hideable
- Include a hide button using the `-` symbol for hide/collapse interactions
- Add a clean navigation bar that matches the existing visual language of the menus and app
- The nav bar must include:
  - map view with a globe icon
  - list view with a bullet list icon
  - favorites with a star icon
- Favorites must continue to use the existing saved lineup behavior
- Do not break any current functionality
- Preserve responsive behavior across desktop and mobile
- Maintain or improve accessibility, especially focus behavior, contrast, hit areas, and discoverability of hidden panels

Implementation guardrails:

- Do not introduce a new data model unless required
- Reuse existing state and behavior where possible
- Prefer layout refactors over broad logic rewrites
- If an overlay version of the current menu styling feels too heavy or obstructive, make the smallest design changes necessary and explain them
- Preserve the no-token fallback experience when `NEXT_PUBLIC_MAPBOX_TOKEN` is missing

Deliverables:

- Updated layout implementation
- Clear show/hide interaction model for overlays
- Updated responsive behavior
- A short implementation note describing what changed and why
- Zero functional regressions in filtering, event selection, saved lineup, date selection, and map/list sync

### 2. Documentation / PM Agent Prompt

Own `README.md` and `PROJECT.md` as living project documents. Keep them aligned with the implementation, document current status and known gaps, and maintain execution-ready prompts for specialist agents. Treat documentation drift as a product risk, not a housekeeping task.

### 3. Frontend Product Cleanup Agent Prompt

Audit the active UI for partial or misleading product affordances. Resolve the current “featured events only” toggle by either implementing it fully with real state/data support or removing it cleanly. Remove or retire unused legacy UI such as `src/components/EventMap.tsx` so contributors have one clear path through the codebase.

### 4. Data Pipeline Agent Prompt

Create a reproducible validation and refresh workflow for `src/data/events.json` and `src/data/filters.json`. Audit missing fields, define schema expectations, and propose any additions needed for future product concepts such as featured events, richer schedule metadata, or better registration status handling.

### 5. QA / Release Agent Prompt

Add automated confidence around the current product. Cover filter logic, saved lineup persistence, no-token map fallback, and URL sanitization in `src/lib/security.ts`. Add CI so future refactors, especially the overlay map redesign, can ship without silent regressions.
