# Project: Boston Tech Week 2026 Interactive Map

## Current-State Snapshot

- Initialized: 2026-04-28
- Phase: MVP hardening, dynamic data integration, map-first overlay refinement, and mobile usability polish
- App status: implemented and production-buildable
- Verification: `npm run lint`, `npm run test`, and `npm run build` pass
- Stack: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Mapbox via `react-map-gl`
- Data model: official Tech Week calendar fetch via `src/lib/tech-week-events.ts`, local fallback `src/data/events.json`, and static UI filter vocabulary in `src/data/filters.json`

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
- Server-side Tech Week calendar ingestion with topic/type enrichment through official `theme` and `format` filters
- Neighborhood-level coordinate approximation with deterministic marker spread while venue precision remains future work

Primary implementation files:

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `src/components/BostonTechWeekApp.tsx`
- `src/components/EventFilters.tsx`
- `src/components/EventCard.tsx`
- `src/components/map/MapView.tsx`
- `src/lib/tech-week-events.ts`
- `src/lib/security.ts`
- `src/data/events.json` fallback data
- `src/data/filters.json` static filter labels

## What Changed Since The Original Plan

The older version of this project document described a repo that had not yet been scaffolded. That is no longer accurate.

Outdated assumptions from the original plan:

- The project is not in planning/setup anymore
- The scaffold already exists
- The data work is beyond just having `filters.json`
- Event data is no longer primarily maintained by hand-editing `events.json`

Accurate framing now:

- The product exists as a working prototype
- The main work is refinement, cleanup, validation, and safe iteration

## Known Gaps

### Product / UX

- The full-screen map overlay refactor has landed as the active experience and remains a key coordination point for UI, cleanup, and QA work
- Mobile still needs focused usability work around small-screen overlay stacking, touch ergonomics, and viewport-space management when filters, list view, and map controls compete for space
- The current mobile experience appears functional, but it has not yet been backed by targeted regression coverage across key breakpoints and saved-lineup flows

### Codebase

- `src/components/EventMap.tsx` appears to be a legacy component and is not the active map path
- Automated Vitest coverage exists for security helpers, the active app shell, saved-lineup persistence, filters, responsive overlay transitions, and the Mapbox-token fallback
- Mobile behavior is concentrated in `src/components/BostonTechWeekApp.tsx`, `src/components/EventFilters.tsx`, `src/components/EventCard.tsx`, and `src/components/map/MapView.tsx`

## Test Environment Specifications

`src/test/testEnv.ts` is the canonical browser-environment shim for Vitest tests. It is loaded globally by `vitest.setup.ts` after `@testing-library/jest-dom/vitest` and before each test's assertions run.

Required behavior:

- Tests run in `jsdom` through `vitest.config.ts` with `clearMocks`, `restoreMocks`, and `globals` enabled
- `vitest.setup.ts` must call Testing Library `cleanup()`, `resetTestBrowserState()`, and `vi.useRealTimers()` after each test
- `setDesktopViewport(isDesktop)` is the only supported test helper for simulating the `(min-width: 768px)` breakpoint used by `BostonTechWeekApp`
- The `matchMedia` mock must expose modern `addEventListener` / `removeEventListener` and legacy `addListener` / `removeListener` APIs because component code or dependencies may use either form
- Viewport changes must notify registered media-query listeners with a `MediaQueryListEvent`-compatible object containing `matches` and `media`
- `resetTestBrowserState()` must restore the mobile viewport default, clear media-query listeners, and clear mocked local storage so tests do not leak browser state
- The `localStorage` mock must preserve browser-like `Storage` behavior: `length`, `clear`, `getItem`, `key`, `removeItem`, and `setItem`; keys and values must be string-coerced like real `localStorage`
- `ResizeObserver` is intentionally a no-op mock; tests that need resize-driven layout behavior should assert resulting UI state directly or introduce a targeted observer test helper rather than making the global shim stateful
- `scrollIntoView` is intentionally mocked as a no-op spy to keep jsdom tests deterministic

QA/TDD expectations:

- Prefer user-observable assertions with Testing Library queries over implementation details
- Keep Mapbox rendering mocked in component tests unless the test specifically targets Mapbox integration boundaries
- Add regression coverage before changing mobile overlays, saved-lineup storage, filter behavior, date tabs, or map/list selection sync
- Keep browser shims minimal and deterministic; add new globals only when production code requires a browser API that jsdom does not provide

### Data

- Primary event data is fetched from the official Tech Week calendar tRPC endpoint in `src/lib/tech-week-events.ts`
- Topic and type filtering depends on a server-side enrichment pass that queries official `theme` and `format` filters, then merges memberships into normalized events
- The official list endpoint does not currently provide precise venue coordinates, rich descriptions, `endTime`, or full registration-state semantics
- `src/data/events.json` is fallback data and can drift from the official calendar if not intentionally refreshed
- `src/data/filters.json` remains static and must stay aligned with the official calendar filter labels/API keys
- `src/data/README.md` documents the fallback data contract and the `npm run data:sync-filters` / `npm run data:validate` workflow

## Priority Roadmap

### P0

- Keep repository docs aligned with the live implementation
- Refine the active full-screen overlay map experience without breaking existing behavior
- Improve mobile usability without regressing desktop map-first behavior

### P1

- Improve official-calendar enrichment, especially venue-level geocoding, descriptions, `endTime`, and registration-state handling
- Expand automated tests and CI around key product flows, especially live data enrichment, mobile edge cases, filters, and saved-lineup behavior

### P2

- Improve shareability, metadata polish, launch QA, and post-MVP enhancements

## Specialist Coordination

Detailed specialist role definitions and handoff guidance now live in `AGENTS.md`.

Current coordination notes:

- Mobile improvement work should preserve the current visual language and focus on layout behavior, touch interaction, and clear state transitions between map, filters, dates, and list panels
- Frontend cleanup, data pipeline work, documentation maintenance, and QA automation should use `AGENTS.md` as the execution brief
- Data validation exists for fallback data, but the live fetch/enrichment path also needs targeted regression coverage
- `endTime`, `registrationState`, venue coordinates, and any future `featured` or `status` fields still need product and data-source coordination before they should be enforced in CI
