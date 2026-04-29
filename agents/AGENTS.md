1. **Project Manager Agent** (Orchestrator)
   - Owns `project.md` and overall roadmap
   - Breaks down tasks, assigns to specialists, reviews PRs/merges
   - Maintains timeline and priorities

2. **Data Agent**
   - Handles event data: scraping/parsing official calendar, enriching with geocoding
   - Maintains `data/` folder (JSON, CSV, or Supabase/DB)
   - Outputs: clean events array with lat/lng, neighborhood, topics, types, times, etc.

3. **Map & Frontend Agent** (Specialist)
   - Builds the interactive map UI
   - Tech: Leaflet.js / Mapbox GL JS + React/Vue/Svelte
   - Implements filters (topics, neighborhoods, types, start times), popups, clustering

4. **Backend / Data Pipeline Agent** (if needed)
   - API layer, auth, dynamic data fetching
   - Optional: Supabase / Firebase / Vercel Postgres

5. **UI/UX + Polish Agent**
   - Responsive design, mobile experience, dark mode, accessibility
   - Visual design and user flows

6. **Testing & Deployment Agent**
   - Unit + E2E tests, performance, mobile testing
   - CI/CD, hosting (Vercel/Netlify)