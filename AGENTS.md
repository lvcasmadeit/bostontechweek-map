<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Specialist Roadmap

Use this file as the canonical handoff guide for specialist agents. `PROJECT.md` tracks project status and priorities; `AGENTS.md` defines role ownership, scope, and execution expectations.

### 1. UI/UX Agent

Status: full-screen map refactor is already underway.

Current assignment:

- Continue the map-first overlay refactor already in motion
- Keep the current visual language unless small adjustments are needed for readability or usability
- Preserve existing functionality including filters, search, saved lineup, date tabs, map/list sync, mobile behavior, and no-token fallback

This role should not restart discovery from scratch unless the active refactor branch proves unworkable.

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

- Keep the current-state snapshot accurate as the UI/UX refactor proceeds
- Record the resolution of the “featured events only” affordance once product direction is finalized
- Update roadmap language when testing, data pipeline, or launch-readiness work lands

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
- Either fully implement the “featured events only” behavior with real state and data support or remove it cleanly
- Confirm whether `src/components/EventMap.tsx` is unused, then retire or remove it if appropriate
- Preserve one obvious source of truth for the active map implementation in `src/components/map/MapView.tsx`
- Coordinate with the UI/UX agent so cleanup work does not conflict with the overlay map refactor

Current priorities:

- Resolve the dead-end featured toggle in `src/components/EventFilters.tsx`
- Remove stale UI/code paths that create confusion for future contributors
- Document any frontend cleanup decisions that affect future handoffs

Guardrails:

- Prefer small, surgical cleanup over broad redesign
- Do not break working flows while removing dead or misleading UI
- If cleanup depends on a product decision that is not yet made, surface the dependency clearly in `PROJECT.md`

Definition of done:

- The UI no longer exposes fake or partial affordances
- The active map/list architecture is easy to identify from the repo structure

### 4. Data Pipeline Agent
You are the data pipline agent.

Mission:

- Turn the static event dataset into a trustworthy, repeatable content pipeline

Owns:

- `src/data/events.json`
- `src/data/filters.json`
- Any supporting validation, generation, or refresh scripts added for data maintenance

Primary responsibilities:

- Audit the current event dataset for missing, weak, or inconsistent fields
- Define schema expectations and validation rules for events and filters
- Create a repeatable process for refreshing or validating the data instead of relying on manual edits
- Propose schema additions needed for future product concepts such as featured events, richer schedule metadata, or better registration-state handling
- Coordinate with frontend owners before introducing fields that materially affect UI assumptions

Current priorities:

- Document the current data contract used by the app
- Address missing `endTime` coverage and incomplete `registrationUrl` coverage
- Define whether future data should support concepts like `featured`, `status`, or event quality flags
- Make it easier to re-run data cleanup without hand-editing large JSON files

Guardrails:

- Preserve compatibility with the current app unless a schema change is explicitly coordinated
- Prefer deterministic validation and generation steps over one-off fixes
- Keep data provenance and transformation logic understandable for future maintainers

Definition of done:

- Another agent can regenerate or validate the dataset using a documented workflow
- The frontend team has a stable, explicit contract for event and filter data

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
- Focus on the product behaviors most likely to break during the map-first refactor
- Document any test gaps that remain after the first pass

Guardrails:

- Target high-signal coverage before broad coverage
- Prefer tests that map clearly to user-facing behavior and known risk areas
- Keep the feedback loop practical enough that contributors will actually run the checks

Definition of done:

- Core discovery flows have automated protection
- CI provides enough signal to support faster iteration on layout, filtering, and data changes
