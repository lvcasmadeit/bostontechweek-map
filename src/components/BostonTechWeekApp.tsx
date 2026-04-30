"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ListFilter, Map as MapIcon, PanelsTopLeft, X } from "lucide-react";
import { EventCard } from "@/src/components/EventCard";
import { EventFilters, type ActiveFilters } from "@/src/components/EventFilters";
import { MapView } from "@/src/components/map/MapView";
import eventsData from "@/src/data/events.json";
import type { Event } from "@/src/types/events";

type ViewMode = "map" | "list";
type ScheduleMode = "schedule" | "lineup";

const SAVED_LINEUP_STORAGE_KEY = "btw-2026-saved-lineup";
const events = eventsData as Event[];
const validEventIds = new Set(events.map((event) => event.id));

const emptyFilters: ActiveFilters = {
  topics: [],
  neighborhoods: [],
  types: [],
  startTimes: [],
};

const dateTabs = [
  { label: "All Week", detail: "May 26-31", value: "all" },
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
      <div className="h-[clamp(34rem,68vh,calc(100vh-7.75rem))] animate-pulse rounded-tech border border-dark-border bg-dark-surface" />
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-tech border border-dark-border bg-dark-surface"
        />
      ))}
    </div>
  );
}

type DateTabBarProps = {
  isOverlay?: boolean;
  onSelectDate: (value: string) => void;
  selectedDate: string;
};

function DateTabBar({
  isOverlay = false,
  onSelectDate,
  selectedDate,
}: DateTabBarProps) {
  return (
    <div
      className={`${
        isOverlay
          ? "pointer-events-auto overflow-x-auto rounded-tech border border-dark-border bg-black/78 p-1 shadow-panel-hard backdrop-blur-md"
          : "overflow-x-auto rounded-tech border border-dark-border bg-dark-panel/80 p-1"
      }`}
    >
      <div className="flex min-w-max gap-1">
        {dateTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onSelectDate(tab.value)}
            className={`flex shrink-0 flex-col border px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] transition sm:px-3 ${
              selectedDate === tab.value
                ? "border-neon-green bg-neon-green text-black shadow-neon-soft"
                : "border-dark-border bg-dark-panel/70 text-text-secondary hover:border-neon-green/60 hover:bg-neon-green-muted hover:text-neon-green"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`mt-0.5 text-[9px] tracking-[0.14em] ${
                selectedDate === tab.value ? "text-black/70" : "text-text-muted"
              }`}
            >
              {tab.detail}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BostonTechWeekApp() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(emptyFilters);
  const [query, setQuery] = useState("");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("schedule");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const selectionOriginRef = useRef<"map" | "list" | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 420);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SAVED_LINEUP_STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as unknown;

      if (Array.isArray(parsed)) {
        setSavedEventIds(
          parsed
            .filter(
              (value): value is string =>
                typeof value === "string" && validEventIds.has(value),
            )
            .slice(0, events.length),
        );
      }
    } catch {
      setSavedEventIds([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SAVED_LINEUP_STORAGE_KEY,
        JSON.stringify(savedEventIds),
      );
    } catch {
      // Ignore storage write failures so private browsing restrictions
      // do not break the interactive UI.
    }
  }, [savedEventIds]);

  const eventById = useMemo(() => {
    return new Map(events.map((event) => [event.id, event]));
  }, []);

  const savedEventIdSet = useMemo(() => new Set(savedEventIds), [savedEventIds]);
  const scopedEvents = useMemo(() => {
    if (scheduleMode === "schedule") {
      return events;
    }

    return events.filter((event) => savedEventIdSet.has(event.id));
  }, [savedEventIdSet, scheduleMode]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return scopedEvents.filter((event) => {
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
  }, [activeFilters, query, scopedEvents, selectedDate]);

  const selectedEvent = selectedEventId ? eventById.get(selectedEventId) ?? null : null;
  const hasSavedEvents = savedEventIds.length > 0;
  const isLineupEmpty = scheduleMode === "lineup" && !hasSavedEvents;
  const hasActiveFilters =
    Boolean(query.trim()) ||
    selectedDate !== "all" ||
    Object.values(activeFilters).some((values) => values.length > 0);

  useEffect(() => {
    if (!filteredEvents.length) {
      setSelectedEventId(null);
      return;
    }

    if (selectedEventId && !filteredEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(null);
    }
  }, [filteredEvents, selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) {
      selectionOriginRef.current = null;
      return;
    }

    if (selectionOriginRef.current !== "list" || viewMode !== "map") {
      if (selectionOriginRef.current === "map") {
        selectionOriginRef.current = null;
      }
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      mapViewportRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      selectionOriginRef.current = null;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedEventId, viewMode]);

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

  function toggleSavedEvent(eventId: string) {
    setSavedEventIds((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId],
    );
  }

  function handleMapSelection(eventId: string | null) {
    selectionOriginRef.current = "map";
    setSelectedEventId(eventId);
  }

  function handleListSelection(eventId: string) {
    selectionOriginRef.current = "list";
    setViewMode("map");
    setSelectedEventId(eventId);
  }

  function renderEventCard(event: Event) {
    return (
      <EventCard
        key={event.id}
        event={event}
        isSaved={savedEventIdSet.has(event.id)}
        isSelected={selectedEventId === event.id}
        onSelect={handleListSelection}
        onToggleSave={toggleSavedEvent}
      />
    );
  }

  return (
    <main className="min-h-screen bg-dark-bg text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col">
        <header className="border-b border-dark-border bg-black/80 px-4 py-3 backdrop-blur md:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-end md:gap-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-neon-green bg-neon-green text-sm font-bold text-black shadow-neon-soft">
                  TW
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neon-green">
                    May 26 - May 31 · Presented by a16z
                  </p>
                  <h1 className="truncate text-2xl font-bold uppercase leading-none tracking-[0.04em] text-text-primary sm:text-3xl">
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
                { mode: "map" as const, label: "Map", icon: MapIcon },
                { mode: "list" as const, label: "List", icon: PanelsTopLeft },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
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
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary transition hover:text-neon-green md:hidden"
              >
                <ListFilter size={16} aria-hidden />
                Filter
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-3 px-3 py-3 md:grid-cols-[18.75rem_minmax(0,1fr)] md:px-4 md:py-4 xl:gap-4">
          <EventFilters
            activeFilters={activeFilters}
            hasActiveFilters={hasActiveFilters}
            mode={scheduleMode}
            query={query}
            onModeChange={setScheduleMode}
            onQueryChange={setQuery}
            onToggleFilter={toggleFilter}
            onClear={clearFilters}
            resultCount={filteredEvents.length}
            savedCount={savedEventIds.length}
            className="hidden md:sticky md:top-4 md:flex md:h-[clamp(34rem,68vh,calc(100vh-7.75rem))] md:self-start"
          />

          <section className="min-w-0">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-neon-green">
                  {scheduleMode === "lineup" ? "Your lineup" : "What&apos;s on"}
                </p>
                <h2 className="mt-1 text-xl font-bold uppercase tracking-[0.06em] sm:text-2xl">
                  {scheduleMode === "lineup"
                    ? "Saved events across map and list"
                    : viewMode === "map"
                      ? "Map-first event discovery"
                      : "List-first event discovery"}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {scheduleMode === "lineup"
                    ? `${filteredEvents.length} saved events matched your current filters.`
                    : `${filteredEvents.length} events matched across Boston and Cambridge.`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
                <CalendarDays size={15} className="text-neon-green" aria-hidden />
                {selectedEvent ? `Selected: ${selectedEvent.title}` : "Map + list sync"}
              </div>
            </div>

            {isLoading ? (
              <EventSkeleton />
            ) : isLineupEmpty ? (
              <div className="rounded-tech border border-dark-border bg-dark-panel p-8 text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neon-green">
                  Empty lineup
                </p>
                <h3 className="mt-2 text-2xl font-bold uppercase">
                  Save events to build your week
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  Use the bookmark controls on event cards or map popups to add sessions you plan to attend.
                </p>
              </div>
            ) : filteredEvents.length ? (
              <div className="space-y-4">
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    viewMode === "map"
                      ? "max-h-[80rem] translate-y-0 opacity-100"
                      : "pointer-events-none max-h-0 -translate-y-4 opacity-0"
                  }`}
                  aria-hidden={viewMode !== "map"}
                  ref={mapViewportRef}
                >
                  <MapView
                    events={filteredEvents}
                    selectedEventId={selectedEventId}
                    savedEventIds={savedEventIdSet}
                    onSelectEvent={handleMapSelection}
                    onToggleSave={toggleSavedEvent}
                    overlay={
                      <DateTabBar
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        isOverlay
                      />
                    }
                    className="h-[clamp(34rem,68vh,calc(100vh-7.75rem))] min-h-[30rem]"
                  />
                </div>

                {viewMode === "list" ? (
                  <DateTabBar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                ) : null}

                <section className="border border-dark-border bg-dark-panel/80 shadow-panel-hard transition-all duration-300">
                  <div className="flex flex-col gap-3 border-b border-dark-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neon-green">
                        Event List
                      </p>
                      <h3 className="mt-1 text-lg font-bold uppercase tracking-[0.08em] text-text-primary">
                        {scheduleMode === "lineup"
                          ? "Your saved schedule below the map"
                          : "Full schedule below the map"}
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                      {filteredEvents.length} visible events
                    </span>
                  </div>
                  <div
                    className={`grid gap-3 p-3 transition-all duration-300 sm:p-4 ${
                      viewMode === "map"
                        ? "lg:grid-cols-2 2xl:grid-cols-3"
                        : "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    }`}
                  >
                    {filteredEvents.map(renderEventCard)}
                  </div>
                </section>
              </div>
            ) : (
              <div className="rounded-tech border border-dark-border bg-dark-panel p-8 text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neon-green">
                  No matches
                </p>
                <h3 className="mt-2 text-2xl font-bold uppercase">
                  {scheduleMode === "lineup"
                    ? "Adjust filters to find saved events"
                    : "Clear filters to rebuild your lineup"}
                </h3>
              </div>
            )}
          </section>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-4 left-4 right-4 z-30 inline-flex items-center justify-center gap-2 rounded-tech border border-neon-green bg-neon-green px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-black shadow-neon-ring md:hidden"
      >
        <ListFilter size={17} aria-hidden />
        Filters · {filteredEvents.length}
      </button>

      {isSheetOpen ? (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden border border-dark-border bg-dark-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-border px-4 py-3">
              <p className="text-sm font-bold uppercase tracking-[0.18em]">
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
              hasActiveFilters={hasActiveFilters}
              mode={scheduleMode}
              query={query}
              onModeChange={setScheduleMode}
              onQueryChange={setQuery}
              onToggleFilter={toggleFilter}
              onClear={clearFilters}
              resultCount={filteredEvents.length}
              savedCount={savedEventIds.length}
              className="max-h-[calc(88vh-4rem)]"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
