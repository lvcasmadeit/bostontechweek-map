"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Globe,
  List,
  ListFilter,
  Star,
} from "lucide-react";
import { EventCard } from "@/src/components/EventCard";
import { EventFilters, type ActiveFilters } from "@/src/components/EventFilters";
import { MapView } from "@/src/components/map/MapView";
import type { Event } from "@/src/types/events";

type ViewMode = "map" | "list";
type ScheduleMode = "schedule" | "lineup";

const SAVED_LINEUP_STORAGE_KEY = "btw-2026-saved-lineup";

type BostonTechWeekAppProps = {
  initialEvents: Event[];
};

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

function EventListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-tech border border-dark-border bg-dark-surface/80"
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
          ? "overflow-x-auto rounded-tech border border-dark-border bg-black/78 p-1 shadow-panel-hard backdrop-blur-md"
          : "overflow-x-auto rounded-tech border border-dark-border bg-dark-panel/80 p-1"
      }`}
    >
      <div className="flex min-w-max gap-1">
        {dateTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onSelectDate(tab.value)}
            className={`flex shrink-0 flex-col border px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green sm:px-3 ${
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

type PanelHeaderProps = {
  description: string;
  title: string;
  onHide: () => void;
};

function PanelHeader({ description, title, onHide }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dark-border px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neon-green">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onHide}
        className="inline-flex h-10 w-10 items-center justify-center rounded-tech border border-white/10 bg-black/30 text-xl leading-none text-text-secondary transition hover:border-neon-green/50 hover:text-neon-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green"
        aria-label={`Hide ${title.toLowerCase()}`}
      >
        <span aria-hidden>-</span>
      </button>
    </div>
  );
}

export function BostonTechWeekApp({ initialEvents }: BostonTechWeekAppProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(emptyFilters);
  const [query, setQuery] = useState("");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("schedule");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isDateBarVisible, setIsDateBarVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [topDockHeight, setTopDockHeight] = useState(232);
  const topDockRef = useRef<HTMLDivElement | null>(null);

  const validEventIds = useMemo(
    () => new Set(initialEvents.map((event) => event.id)),
    [initialEvents],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 420);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => {
      setIsDesktop(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setIsFiltersVisible(true);
    }
  }, [isDesktop]);

  useEffect(() => {
    const topDock = topDockRef.current;

    if (!topDock) {
      return;
    }

    const syncHeight = () => {
      setTopDockHeight(Math.ceil(topDock.getBoundingClientRect().height));
    };

    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(topDock);
    window.addEventListener("resize", syncHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, [isDateBarVisible]);

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
            .slice(0, initialEvents.length),
        );
      }
    } catch {
      setSavedEventIds([]);
    }
  }, [initialEvents.length, validEventIds]);

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
    return new Map(initialEvents.map((event) => [event.id, event]));
  }, [initialEvents]);

  const savedEventIdSet = useMemo(() => new Set(savedEventIds), [savedEventIds]);
  const scopedEvents = useMemo(() => {
    if (scheduleMode === "schedule") {
      return initialEvents;
    }

    return initialEvents.filter((event) => savedEventIdSet.has(event.id));
  }, [initialEvents, savedEventIdSet, scheduleMode]);

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
  const activeControlCount =
    Object.values(activeFilters).reduce((count, values) => count + values.length, 0) +
    (query.trim() ? 1 : 0) +
    (selectedDate !== "all" ? 1 : 0);
  const panelInsetTop = topDockHeight + 12;

  useEffect(() => {
    if (!filteredEvents.length) {
      setSelectedEventId(null);
      return;
    }

    if (selectedEventId && !filteredEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(null);
    }
  }, [filteredEvents, selectedEventId]);

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
    setSelectedEventId(eventId);
  }

  function activateMapView() {
    setViewMode("map");
  }

  function activateListView() {
    if (!isDesktop) {
      setIsFiltersVisible(false);
    }

    setViewMode("list");
  }

  function handleListSelection(eventId: string) {
    setSelectedEventId(eventId);
    activateMapView();
  }

  function toggleFiltersPanel() {
    const nextVisibility = !isFiltersVisible;

    setIsFiltersVisible(nextVisibility);

    if (nextVisibility && !isDesktop) {
      setViewMode("map");
    }
  }

  function toggleFavoritesMode() {
    if (scheduleMode === "lineup") {
      setScheduleMode("schedule");
      return;
    }

    setScheduleMode("lineup");

    if (!isDesktop) {
      setIsFiltersVisible(false);
    }

    setViewMode("list");
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
    <main className="relative h-[100svh] min-h-screen overflow-hidden bg-dark-bg text-text-primary">
      <MapView
        events={filteredEvents}
        selectedEventId={selectedEventId}
        savedEventIds={savedEventIdSet}
        onSelectEvent={handleMapSelection}
        onToggleSave={toggleSavedEvent}
        className="h-full min-h-screen rounded-none border-0"
      />

      <div ref={topDockRef} className="absolute inset-x-0 top-0 z-40 px-3 py-3 md:px-4 md:py-4">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(16rem,1fr)_minmax(18rem,34rem)_minmax(16rem,1fr)] md:items-start">
          <section className="pointer-events-auto rounded-tech border border-dark-border bg-black/80 px-4 py-3 shadow-panel-hard backdrop-blur-md md:justify-self-start">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border border-neon-green bg-neon-green text-sm font-bold text-black shadow-neon-soft">
                TW
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-neon-green">
                  May 26 - May 31 · Presented by a16z
                </p>
                <h1 className="mt-1 text-lg font-bold uppercase tracking-[0.06em] text-text-primary sm:text-xl">
                  Boston Tech Week 2026
                </h1>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  City-wide event discovery across Boston and Cambridge.
                </p>
              </div>
            </div>
          </section>

          {isDateBarVisible ? (
            <div className="pointer-events-auto md:justify-self-center md:self-start md:w-full md:max-w-[34rem]">
              <div id="btw-date-panel" className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <DateTabBar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    isOverlay
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsDateBarVisible(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-tech border border-dark-border bg-black/78 text-xl leading-none text-text-secondary shadow-panel-hard backdrop-blur-md transition hover:border-neon-green/40 hover:text-neon-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green"
                  aria-label="Hide date filters"
                >
                  <span aria-hidden>-</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:block" />
          )}

          <div className="pointer-events-auto flex flex-col gap-2 self-start md:justify-self-end md:items-end">
            <nav
              aria-label="Primary navigation"
              className="rounded-tech border border-dark-border bg-black/80 p-1 shadow-panel-hard backdrop-blur-md"
            >
              <div className="grid grid-cols-3 gap-1">
                {[
                  {
                    active: viewMode === "map",
                    icon: Globe,
                    label: "Map view",
                    onClick: activateMapView,
                  },
                  {
                    active: viewMode === "list",
                    icon: List,
                    label: "List view",
                    onClick: activateListView,
                  },
                  {
                    active: scheduleMode === "lineup",
                    icon: Star,
                    label: "Favorites",
                    onClick: toggleFavoritesMode,
                  },
                ].map(({ active, icon: Icon, label, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    aria-pressed={active}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.3rem] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green ${
                      active
                        ? "bg-neon-green text-black shadow-neon-soft"
                        : "text-text-secondary hover:bg-white/[0.04] hover:text-neon-green"
                    }`}
                  >
                    <Icon size={16} aria-hidden />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </nav>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <button
                type="button"
                onClick={toggleFiltersPanel}
                aria-controls="btw-filters-panel"
                aria-expanded={isFiltersVisible}
                className={`inline-flex min-h-10 items-center gap-2 rounded-tech border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green ${
                  isFiltersVisible || hasActiveFilters
                    ? "border-neon-green/40 bg-black/78 text-neon-green shadow-neon-soft backdrop-blur-md"
                    : "border-dark-border bg-black/72 text-text-secondary hover:border-neon-green/40 hover:text-neon-green backdrop-blur-md"
                }`}
              >
                <ListFilter size={15} aria-hidden />
                <span>Filters</span>
                <span className="text-[10px] text-text-muted">
                  {activeControlCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsDateBarVisible((current) => !current)}
                aria-controls="btw-date-panel"
                aria-expanded={isDateBarVisible}
                className={`inline-flex min-h-10 items-center gap-2 rounded-tech border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green ${
                  isDateBarVisible || selectedDate !== "all"
                    ? "border-neon-green/40 bg-black/78 text-neon-green shadow-neon-soft backdrop-blur-md"
                    : "border-dark-border bg-black/72 text-text-secondary hover:border-neon-green/40 hover:text-neon-green backdrop-blur-md"
                }`}
              >
                <CalendarDays size={15} aria-hidden />
                <span>Dates</span>
              </button>
            </div>
            <div className="pointer-events-none self-end rounded-tech border border-dark-border bg-black/70 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary backdrop-blur">
              <span className="text-neon-green">{filteredEvents.length}</span> mapped events
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute left-3 right-3 bottom-4 z-40 transition duration-300 md:left-4 md:right-auto md:w-80 lg:w-[21rem] ${
          isFiltersVisible
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-8 opacity-0"
        }`}
        style={{ top: `${panelInsetTop}px` }}
      >
        <section
          id="btw-filters-panel"
          aria-label="Event filters"
          className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-tech border border-dark-border bg-black/78 shadow-panel-hard backdrop-blur-md"
        >
          <PanelHeader
            title="Controls"
            description="Search, switch between schedule and lineup, and refine the live map."
            onHide={() => setIsFiltersVisible(false)}
          />
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
            className="min-h-0 flex-1 border-0 bg-transparent shadow-none"
          />
        </section>
      </div>

      <div
        className={`absolute left-3 right-3 bottom-4 z-40 transition duration-300 md:left-auto md:right-4 md:w-[min(28rem,calc(100vw-24rem))] xl:w-[31rem] ${
          viewMode === "list"
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0 md:translate-x-8 md:translate-y-0"
        }`}
        style={{ top: `${panelInsetTop}px` }}
      >
        <section
          aria-label="Event list"
          className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-tech border border-dark-border bg-black/78 shadow-panel-hard backdrop-blur-md"
        >
          <PanelHeader
            title={scheduleMode === "lineup" ? "Favorites" : "Event List"}
            description={
              scheduleMode === "lineup"
                ? "Saved events stay synced with the map and local lineup storage."
                : "Browse matching events while keeping the map visible underneath."
            }
            onHide={activateMapView}
          />

          <div className="flex items-center justify-between gap-3 border-b border-dark-border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
            <span>
              {scheduleMode === "lineup"
                ? `${filteredEvents.length} saved events`
                : `${filteredEvents.length} visible events`}
            </span>
            <span className="truncate text-right text-text-primary">
              {selectedEvent ? `Selected: ${selectedEvent.title}` : "Map + list sync"}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <EventListSkeleton />
            ) : isLineupEmpty ? (
              <div className="p-4">
                <div className="rounded-tech border border-dark-border bg-dark-panel/90 p-6 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neon-green">
                    Empty lineup
                  </p>
                  <h2 className="mt-2 text-2xl font-bold uppercase">
                    Save events to build your week
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
                    Use the bookmark controls on cards or map popups to add sessions you plan to attend.
                  </p>
                </div>
              </div>
            ) : filteredEvents.length ? (
              <div className="grid gap-3 p-4">
                {filteredEvents.map(renderEventCard)}
              </div>
            ) : (
              <div className="p-4">
                <div className="rounded-tech border border-dark-border bg-dark-panel/90 p-6 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neon-green">
                    No matches
                  </p>
                  <h2 className="mt-2 text-2xl font-bold uppercase">
                    {scheduleMode === "lineup"
                      ? "Adjust filters to find saved events"
                      : "Clear filters to rebuild your lineup"}
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
                    The map is still live underneath, and the filter panel can be reopened at any time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
