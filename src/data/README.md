# Data Contract

`src/data/events.json` is the source of truth for Boston Tech Week events. `src/data/filters.json` is a derived artifact that should stay in sync with the current event set.

## Event shape

Required fields enforced by the validator:

- `id`: stable unique string identifier
- `title`: user-facing event name
- `startTime`: ISO-like local datetime string used by date tabs and time buckets
- `neighborhood`: filterable location label shown in the UI
- `lat` / `lng`: map coordinates
- `topics`: non-empty string array
- `type`: filterable event type
- `host`: organizer label
- `description`: search/index text
- `isFree`: boolean used for event access labeling
- `isInviteOnly`: boolean used for event access labeling

Optional fields supported by the current app:

- `endTime`: optional display field; recommended whenever a trustworthy source exists
- `venue`: optional venue label
- `address`: optional address detail
- `registrationUrl`: optional public registration URL; must be a safe `https:` URL when present

## Filter shape

`src/data/filters.json` must contain these arrays:

- `topics`
- `neighborhoods`
- `types`
- `start_times`

The file should be regenerated from `events.json`, not hand-edited.

## Workflow

1. Update or replace `src/data/events.json`.
2. Run `npm run data:sync-filters`.
3. Run `npm run data:validate`.

`data:validate` fails on schema drift or unsafe values and warns on quality gaps that are still tolerated by the current UI.

## Current audit

Snapshot from May 1, 2026:

- `573` events total
- `573` events missing `endTime`
- `89` events missing `registrationUrl`
- `8` shared `registrationUrl` values across multiple events
- `filters.json` matches the values currently present in `events.json`

## Future schema recommendations

These fields should be coordinated with frontend owners before they are added to the live contract:

- `featured: boolean`
  Use only after product defines how featured events affect search, filters, and ranking.
- `status: "scheduled" | "waitlist" | "sold_out" | "cancelled"`
  Keeps event lifecycle state separate from price or invite restrictions.
- `registrationState: "public" | "invite_only" | "none"`
  Clarifies why `registrationUrl` is absent instead of treating every missing URL as the same case.
- `qualityFlags: string[]`
  Pipeline-owned metadata such as `missing-end-time`, `missing-registration-url`, or `shared-registration-url`.
