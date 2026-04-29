# Project: Boston Tech Week 2026 Interactive Map

## Status
- **Initialized**: 2026-04-28
- **Current Phase**: Planning & Setup
- **Scaffold**: Not yet created
- **Data**: `filters.json` ready (topics, neighborhoods, types, start_times)

## Overview
Boston Tech Week 2026 is a decentralized city-wide tech event series (May 26–31) with 500+ events across Boston/Cambridge area.  
Official source: [tech-week.com/calendar/boston](https://www.tech-week.com/calendar/boston)

**Goal**: Build a beautiful, interactive web map that helps attendees discover, filter, and navigate all events.

## Goals & Non-Goals
**Primary Goals**
- Visualize all events on an interactive map of Boston
- Powerful filtering by Topics, Neighborhood, Type, Start Time, and Date
- Clean event list + map synchronization
- Fast, mobile-friendly UX

**Nice-to-Haves (Post-MVP)**
- Dynamic scraping / daily data refresh
- User accounts / saved events
- Calendar integration (Google/Apple)
- AI event recommendations

**Non-Goals**
- Full backend/auth system for MVP
- Real-time RSVPs

## MVP Scope
- Interactive Mapbox map centered on Boston
- Event markers with clustering
- Sidebar filters:
  - Topics (multi-select)
  - Neighborhoods (multi-select)
  - Types (multi-select)
  - Start Time (multi-select)
  - Date picker (May 26–31)
- Search bar (by title, host, description)
- Toggle between Map View and List View
- Event popup with: title, time, location, host, short description, registration link
- Responsive design (mobile + desktop)

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Map**: Mapbox GL JS (`react-map-gl` or `@mapbox/mapbox-gl-react`)
- **State Management**: Zustand or React Context
- **Data**: Static `events.json` + `filters.json` initially
- **Geocoding**: Mapbox Geocoding API
- **Hosting**: Vercel
- **Icons**: Lucide React


## Data Model (events.json)
Each event should contain:
```ts
{
  id: string;
  title: string;
  startTime: string;        // ISO or "2026-05-27T09:00"
  endTime?: string;
  neighborhood: string;
  venue?: string;
  address?: string;
  lat: number;
  lng: number;
  topics: string[];
  type: string;             // "Panel", "Networking", etc.
  host: string;
  description: string;
  registrationUrl?: string;
  isFree?: boolean;
}