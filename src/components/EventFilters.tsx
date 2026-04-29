"use client";

import { ChevronDown, Filter, Search, X } from "lucide-react";
import filters from "@/src/data/filters.json";
import { useState } from "react";

type FilterKey = "topics" | "neighborhoods" | "types" | "startTimes";

export type ActiveFilters = Record<FilterKey, string[]>;

type EventFiltersProps = {
  activeFilters: ActiveFilters;
  query: string;
  onQueryChange: (query: string) => void;
  onToggleFilter: (key: FilterKey, value: string) => void;
  onClear: () => void;
  resultCount: number;
  className?: string;
};

const filterSections: Array<{
  key: FilterKey;
  label: string;
  values: string[];
  defaultLimit: number;
  collapsible: boolean;
}> = [
  {
    key: "topics",
    label: "Topics",
    values: filters.topics,
    defaultLimit: 8,
    collapsible: true,
  },
  {
    key: "neighborhoods",
    label: "Neighborhood",
    values: filters.neighborhoods,
    defaultLimit: 8,
    collapsible: true,
  },
  {
    key: "types",
    label: "Types",
    values: filters.types,
    defaultLimit: 7,
    collapsible: true,
  },
  {
    key: "startTimes",
    label: "Start time",
    values: filters.start_times,
    defaultLimit: filters.start_times.length,
    collapsible: true,
  },
];

export function EventFilters({
  activeFilters,
  query,
  onQueryChange,
  onToggleFilter,
  onClear,
  resultCount,
  className = "",
}: EventFiltersProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<FilterKey, boolean>>({
    topics: false,
    neighborhoods: false,
    types: false,
    startTimes: false,
  });
  const [expandedLists, setExpandedLists] = useState<Record<FilterKey, boolean>>({
    topics: false,
    neighborhoods: false,
    types: false,
    startTimes: false,
  });

  const activeCount = Object.values(activeFilters).reduce(
    (total, values) => total + values.length,
    0,
  );

  function toggleSection(key: FilterKey) {
    setCollapsedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function toggleList(key: FilterKey) {
    setExpandedLists((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <aside
      className={`flex h-full flex-col border-dark-border bg-dark-panel/95 text-text-primary shadow-panel-hard ${className}`}
    >
      <div className="border-b border-dark-border p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neon-green">
              Build your lineup
            </p>
            <h2 className="mt-1 text-lg font-extrabold uppercase tracking-[0.08em]">
              Filters
            </h2>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-tech border border-neon-green/30 bg-neon-green-muted text-neon-green shadow-neon-soft">
            <Filter size={18} aria-hidden />
          </div>
        </div>

        <label className="group flex items-center gap-3 rounded-tech border border-dark-border bg-black/45 px-3 py-2.5 transition focus-within:border-neon-green focus-within:shadow-neon-soft">
          <Search size={17} className="text-text-secondary group-focus-within:text-neon-green" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search BOS events"
            className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
          />
        </label>

        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-text-secondary">
          <span>{resultCount} events</span>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 border border-neon-green/30 px-2 py-1 font-bold text-neon-green transition hover:border-neon-green hover:bg-neon-green-muted hover:text-neon-green-soft"
          >
            <X size={13} aria-hidden />
            Clear {activeCount ? `(${activeCount})` : ""}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 pb-24 md:pb-4">
        {filterSections.map((section) => {
          const isCollapsed = collapsedSections[section.key];
          const isExpanded = expandedLists[section.key];
          const visibleValues = isExpanded
            ? section.values
            : section.values.slice(0, section.defaultLimit);
          const hiddenCount = section.values.length - visibleValues.length;
          const activeSectionCount = activeFilters[section.key].length;

          return (
            <section
              key={section.key}
              className="border border-dark-border bg-black/20"
            >
              <div className="flex items-center justify-between gap-2 border-b border-dark-border px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => section.collapsible && toggleSection(section.key)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={!isCollapsed}
                >
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-neon-green transition ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                    aria-hidden
                  />
                  <span className="truncate text-xs font-extrabold uppercase tracking-[0.18em] text-text-primary">
                    {section.label}
                  </span>
                </button>
                {activeSectionCount ? (
                  <span className="border border-neon-green/40 bg-neon-green-muted px-1.5 py-0.5 text-[10px] font-black text-neon-green">
                    {activeSectionCount}
                  </span>
                ) : null}
              </div>

              {!isCollapsed ? (
                <div className="space-y-3 px-3 py-3">
                  <div className="grid grid-cols-2 gap-1.5">
                    {visibleValues.map((value) => {
                      const isActive = activeFilters[section.key].includes(value);

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onToggleFilter(section.key, value)}
                          className={`min-h-9 border px-2 py-1.5 text-left text-[11px] font-bold leading-tight transition duration-200 hover:-translate-y-px ${
                            isActive
                              ? "border-neon-green bg-neon-green text-black shadow-neon-soft"
                              : "border-white/10 bg-white/[0.035] text-text-secondary hover:border-neon-green/60 hover:bg-neon-green-muted hover:text-neon-green"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>

                  {section.values.length > section.defaultLimit ? (
                    <button
                      type="button"
                      onClick={() => toggleList(section.key)}
                      className="w-full border border-neon-green/30 bg-neon-green-muted px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-neon-green transition hover:border-neon-green hover:bg-neon-green hover:text-black"
                    >
                      {isExpanded ? "Show less" : `Show all +${hiddenCount}`}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
