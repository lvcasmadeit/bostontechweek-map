"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ListFilter, Map, PanelsTopLeft, X } from "lucide-react";
import { EventCard } from "@/src/components/EventCard";
import { EventFilters, type ActiveFilters } from "@/src/components/EventFilters";
import { MapView } from "@/src/components/map/MapView";
import eventsData from "@/src/data/events.json";
import type { Event } from "@/src/types/events";

type ViewMode = "map" | "list";

const events = eventsData as Event[];

const emptyFilters: ActiveFilters = {
  topics: [],
  neighborhoods: [],
  types: [],
  startTimes: [],
};

const dateTabs = [
  { label: "All", detail: "Week", value: "all" },
  { label: "Tue", detail: "May 26", value: "2026-05-26" },
  { label: "Wed", detail: "May 27", value: "2026-05-27" },
  { label: "Thu", detail: "May 28", value: "2026-05-28" },
  { label: "Fri", detail: "May 29", value: "2026-05-29" },
  { label: "Sat", detail: "May 30", value: "2026-05-30" },
  { label: "Sun", detail: "May 31", value: "2026-05-31" },
];

function getStartTimeBucket(event: Event) {
  const hour = new Date(event.startTime).getHours();

  if (hour < 12) {
    return "Morning";
  }

  if (hour === 12) {
    return "Noon";
  }

  if (hour < 17) {
    return "Afternoon";
  }

  return "Evening";
}

function matchesAny(selected: string[], values: string[]) {
  return selected.length === 0 || selected.some((value) => values.includes(value));
}

function EventSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-tech border border-dark-border bg-dark-surface"
        />
      ))}
    </div>
  );
}

export function BostonTechWeekApp() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(emptyFilters);
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(events[0] ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 420);

    return () => window.clearTimeout(timeout);
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events.filter((event) => {
      const eventDate = event.startTime.slice(0, 10);
      const searchBlob = [
        event.title,
        event.host,
        event.description,
        event.venue,
        event.neighborhood,
        event.type,
        ...event.topics,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (selectedDate === "all" || eventDate === selectedDate) &&
        (!normalizedQuery || searchBlob.includes(normalizedQuery)) &&
        matchesAny(activeFilters.topics, event.topics) &&
        matchesAny(activeFilters.neighborhoods, [event.neighborhood]) &&
        matchesAny(activeFilters.types, [event.type]) &&
        matchesAny(activeFilters.startTimes, [getStartTimeBucket(event)])
      );
    });
  }, [activeFilters, query, selectedDate]);

  useEffect(() => {
    if (!filteredEvents.length) {
      setSelectedEvent(null);
      return;
    }

    if (!selectedEvent || !filteredEvents.some((event) => event.id === selectedEvent.id)) {
      setSelectedEvent(filteredEvents[0]);
    }
  }, [filteredEvents, selectedEvent]);

  function toggleFilter(key: keyof ActiveFilters, value: string) {
    setActiveFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  }

  function clearFilters() {
    setActiveFilters(emptyFilters);
    setQuery("");
    setSelectedDate("all");
  }

  return (
    <main className="min-h-screen bg-dark-bg text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col">
        <header className="border-b border-dark-border bg-black/80 px-4 py-3 backdrop-blur md:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-end md:gap-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-neon-green bg-neon-green text-sm font-black text-black shadow-neon-soft">
                  TW
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-neon-green">
                    May 26 - May 31 · Presented by a16z
                  </p>
                  <h1 className="truncate text-2xl font-black uppercase leading-none tracking-[0.04em] text-text-primary sm:text-3xl">
                    Boston Tech Week 2026
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-5 text-text-secondary">
                City-wide event discovery across Boston and Cambridge.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1 border border-dark-border bg-dark-panel p-1 md:grid-cols-2">
              {[
                { mode: "map" as const, label: "Map", icon: Map },
                { mode: "list" as const, label: "List", icon: PanelsTopLeft },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] transition ${
                    viewMode === mode
                      ? "bg-neon-green text-black shadow-neon-soft"
                      : "text-text-secondary hover:text-neon-green"
                  }`}
                >
                  <Icon size={16} aria-hidden />
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsSheetOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-text-secondary transition hover:text-neon-green md:hidden"
              >
                <ListFilter size={16} aria-hidden />
                Filter
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 md:grid-cols-[19rem_minmax(0,1fr)] 2xl:grid-cols-[19rem_minmax(0,1fr)]">
          <EventFilters
            activeFilters={activeFilters}
            query={query}
            onQueryChange={setQuery}
            onToggleFilter={toggleFilter}
            onClear={clearFilters}
            resultCount={filteredEvents.length}
            className="hidden border-r md:flex"
          />

          <section className="min-w-0 px-3 py-3 md:px-4">
            <div className="mb-3 flex gap-1.5 overflow-x-auto border-b border-dark-border pb-3">
              {dateTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedDate(tab.value)}
                  className={`flex shrink-0 flex-col border px-4 py-2 text-left text-xs font-extrabold uppercase tracking-[0.16em] transition ${
                    selectedDate === tab.value
                      ? "border-neon-green bg-neon-green text-black shadow-neon-soft"
                      : "border-dark-border bg-dark-panel text-text-secondary hover:border-neon-green/60 hover:bg-neon-green-muted hover:text-neon-green"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`mt-0.5 text-[10px] tracking-[0.12em] ${
                      selectedDate === tab.value ? "text-black/70" : "text-text-muted"
                    }`}
                  >
                    {tab.detail}
                  </span>
                </button>
              ))}
            </div>

            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-neon-green">
                  What&apos;s on
                </p>
                <h2 className="mt-1 text-xl font-black uppercase tracking-[0.06em]">
                  {filteredEvents.length} featured events
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-text-secondary">
                <CalendarDays size={15} className="text-neon-green" aria-hidden />
                BOS 2026
              </div>
            </div>

            {isLoading ? (
              <EventSkeleton />
            ) : filteredEvents.length ? (
              <div
                className={
                  viewMode === "map"
                    ? "grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]"
                    : "grid gap-3 md:grid-cols-2 xl:grid-cols-3"
                }
              >
                {viewMode === "map" ? (
                  <>
                    <MapView
                      events={filteredEvents}
                      selectedEvent={selectedEvent}
                      onSelectEvent={setSelectedEvent}
                      className="xl:h-[calc(100vh-10rem)]"
                    />
                    <div className="min-h-0 border border-dark-border bg-dark-panel/80 shadow-panel-hard xl:h-[calc(100vh-10rem)]">
                      <div className="flex items-center justify-between border-b border-dark-border px-3 py-2.5">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-primary">
                          Event List
                        </p>
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neon-green">
                          {filteredEvents.length}
                        </span>
                      </div>
                      <div className="space-y-2 overflow-y-auto p-2 xl:h-[calc(100%-2.75rem)]">
                        {filteredEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            isSelected={selectedEvent?.id === event.id}
                            onSelect={setSelectedEvent}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isSelected={selectedEvent?.id === event.id}
                      onSelect={setSelectedEvent}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="rounded-tech border border-dark-border bg-dark-panel p-8 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neon-green">
                  No matches
                </p>
                <h3 className="mt-2 text-2xl font-black uppercase">
                  Clear filters to rebuild your lineup
                </h3>
              </div>
            )}
          </section>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-4 left-4 right-4 z-30 inline-flex items-center justify-center gap-2 rounded-tech border border-neon-green bg-neon-green px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-neon-ring md:hidden"
      >
        <ListFilter size={17} aria-hidden />
        Filters · {filteredEvents.length}
      </button>

      {isSheetOpen ? (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden border border-dark-border bg-dark-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-border px-4 py-3">
              <p className="text-sm font-black uppercase tracking-[0.18em]">
                Filter Events
              </p>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="flex h-9 w-9 items-center justify-center border border-white/10 text-text-secondary transition hover:border-neon-green hover:text-neon-green"
                aria-label="Close filters"
              >
                <X size={17} aria-hidden />
              </button>
            </div>
            <EventFilters
              activeFilters={activeFilters}
              query={query}
              onQueryChange={setQuery}
              onToggleFilter={toggleFilter}
              onClear={clearFilters}
              resultCount={filteredEvents.length}
              className="max-h-[calc(88vh-4rem)]"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
