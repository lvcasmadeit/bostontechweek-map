<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Specialist Roadmap

Use this file as the canonical handoff guide for specialist agents. `PROJECT.md` tracks project status and priorities; `AGENTS.md` defines role ownership, scope, and execution expectations.

### 1. UI/UX Agent

Status: the full-screen map-first overlay is the active experience.

Current assignment:

- Refine the active map-first overlay experience without restarting the layout direction
- Keep the current visual language unless small adjustments are needed for readability or usability
- Preserve existing functionality including filters, search, saved lineup, date tabs, map/list sync, mobile behavior, and no-token fallback

This role should not restart discovery from scratch unless the active map-first architecture proves unworkable.

### 2. Documentation / PM Agent

Mission:

- Keep the repository understandable to both outside visitors and internal contributors
- Prevent documentation drift from becoming a coordination risk

Owns:

- `README.md`
- `PROJECT.md`

Primary responsibilities:

- Keep `README.md` product-facing, concise, and suitable for GitHub visitors
- Keep sensitive, security-relevant, or low-value implementation details out of `README.md`
- Keep `PROJECT.md` as the internal operating document for current state, known gaps, priorities, and active workstreams
- Re-audit both docs whenever the product experience, architecture, roadmap, or team workflow changes materially
- Make sure the docs reflect what the application actually does today, not what an older plan expected it to do

Current priorities:

- Keep the current-state snapshot accurate as the dynamic data path and UI polish evolve
- Keep README language product-facing while leaving implementation handoff details in `PROJECT.md`
- Update roadmap language when testing, data pipeline, venue geocoding, or launch-readiness work lands

Definition of done:

- A GitHub visitor can understand the product quickly from `README.md`
- A specialist agent can open `PROJECT.md` and understand status, risks, and what to do next without hunting through code

### 3. Frontend Cleanup Agent

Mission:

- Reduce ambiguity in the UI and codebase so future frontend work has one clear path

Owns:

- Cleanup of partial, misleading, legacy, or duplicate frontend behavior

Primary responsibilities:

- Audit the active interface for controls that suggest functionality the app does not actually provide
- Confirm whether `src/components/EventMap.tsx` is unused, then retire or remove it if appropriate
- Preserve one obvious source of truth for the active map implementation in `src/components/map/MapView.tsx`
- Coordinate with the UI/UX agent so cleanup work does not conflict with the overlay map experience

Current priorities:

- Remove stale UI/code paths that create confusion for future contributors
- Keep map/list/filter/date interactions clear as the overlay UI is refined
- Document any frontend cleanup decisions that affect future handoffs

Guardrails:

- Prefer small, surgical cleanup over broad redesign
- Do not break working flows while removing dead or misleading UI
- If cleanup depends on a product decision that is not yet made, surface the dependency clearly in `PROJECT.md`

Definition of done:

- The UI no longer exposes fake or partial affordances
- The active map/list architecture is easy to identify from the repo structure

### 4. Data Pipeline Agent

Mission:

- Keep official Tech Week calendar ingestion trustworthy, explainable, and compatible with the frontend event contract

Owns:

- `src/lib/tech-week-events.ts`
- `src/data/events.json`
- `src/data/filters.json`
- Any supporting validation, generation, or refresh scripts added for data maintenance

Primary responsibilities:

- Maintain the official calendar fetcher, pagination, normalization, fallback behavior, and topic/type enrichment pass
- Audit fetched and fallback event data for missing, weak, or inconsistent fields
- Define schema expectations and validation rules for events and static filters
- Keep `filters.json` aligned with official calendar labels and API keys used by `theme` and `format` filters
- Propose schema additions needed for venue-level geocoding, featured events, richer schedule metadata, or better registration-state handling
- Coordinate with frontend owners before introducing fields that materially affect UI assumptions

Current priorities:

- Improve venue-level map precision beyond neighborhood coordinates
- Add confidence around the topic/type enrichment pass so filter behavior cannot silently regress
- Address missing `endTime`, description, and registration-state coverage where the source permits
- Define whether future data should support concepts like `featured`, `status`, or event quality flags
- Keep fallback data validation useful without treating fallback JSON as the primary source of truth

Guardrails:

- Preserve compatibility with the current app unless a schema change is explicitly coordinated
- Prefer deterministic validation and generation steps over one-off fixes
- Keep data provenance and transformation logic understandable for future maintainers

Definition of done:

- Another agent can understand, validate, and safely modify the official calendar ingestion flow
- The frontend team has a stable, explicit contract for fetched events, fallback events, and static filter data

### 5. QA / Release Agent

Mission:

- Add confidence so product refactors can move quickly without silent regressions

Owns:

- Automated validation of critical user flows
- CI-level quality checks
- Release readiness for major UI and data changes

Primary responsibilities:

- Add coverage for filtering behavior across multiple dimensions
- Add coverage for saved lineup persistence and recovery
- Add coverage for no-token fallback behavior when the live map is unavailable
- Add coverage for registration URL safety behavior in `src/lib/security.ts`
- Introduce CI checks so future layout and data refactors are gated by repeatable quality signals

Current priorities:

- Establish the first automated regression suite for the repo
- Focus on the product behaviors most likely to break during map-first layout and data changes
- Document any test gaps that remain after the first pass

Guardrails:

- Target high-signal coverage before broad coverage
- Prefer tests that map clearly to user-facing behavior and known risk areas
- Keep the feedback loop practical enough that contributors will actually run the checks

Definition of done:

- Core discovery flows have automated protection
- CI provides enough signal to support faster iteration on layout, filtering, and data changes
