# Data Contract

Live Boston Tech Week events are fetched and normalized by `src/lib/tech-week-events.ts`. `src/data/events.json` is fallback data used if the official calendar request fails. `src/data/filters.json` is the static filter vocabulary used by the UI and should stay aligned with the official calendar labels/API keys.

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

The file is currently static. If fallback data is intentionally refreshed from `events.json`, it can be regenerated with `npm run data:sync-filters`, but live topic/type behavior depends on the official calendar `theme` and `format` filter keys matching these labels.

## Workflow

1. Prefer updating `src/lib/tech-week-events.ts` when changing live ingestion behavior.
2. Update or replace `src/data/events.json` only when fallback data needs refreshing.
3. If fallback event values change, run `npm run data:sync-filters` only when you intentionally want `filters.json` regenerated from fallback data.
4. Run `npm run data:validate` after fallback data changes.

`data:validate` fails on schema drift or unsafe values and warns on quality gaps that are still tolerated by the current UI.

## Current audit

Fallback snapshot from May 1, 2026:

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
