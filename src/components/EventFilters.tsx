"use client";

import { Search, X } from "lucide-react";
import filters from "@/src/data/filters.json";
import { useState } from "react";

type FilterKey = "topics" | "neighborhoods" | "types" | "startTimes";
type ScheduleMode = "schedule" | "lineup";

export type ActiveFilters = Record<FilterKey, string[]>;

type EventFiltersProps = {
  activeFilters: ActiveFilters;
  className?: string;
  hasActiveFilters: boolean;
  mode: ScheduleMode;
  onClear: () => void;
  onModeChange: (mode: ScheduleMode) => void;
  onQueryChange: (query: string) => void;
  onToggleFilter: (key: FilterKey, value: string) => void;
  query: string;
  resultCount: number;
  savedCount: number;
};

const filterSections: Array<{
  key: FilterKey;
  label: string;
  values: string[];
  defaultLimit: number;
}> = [
  { key: "topics", label: "Topics", values: filters.topics, defaultLimit: 8 },
  {
    key: "neighborhoods",
    label: "Neighborhood",
    values: filters.neighborhoods,
    defaultLimit: 8,
  },
  { key: "types", label: "Types", values: filters.types, defaultLimit: 7 },
  {
    key: "startTimes",
    label: "Start time",
    values: filters.start_times,
    defaultLimit: filters.start_times.length,
  },
];

export function EventFilters({
  activeFilters,
  className = "",
  hasActiveFilters,
  mode,
  onClear,
  onModeChange,
  onQueryChange,
  onToggleFilter,
  query,
  resultCount,
  savedCount,
}: EventFiltersProps) {
  const [expandedLists, setExpandedLists] = useState<Record<FilterKey, boolean>>({
    topics: false,
    neighborhoods: false,
    types: false,
    startTimes: false,
  });
  const [featuredOnly, setFeaturedOnly] = useState(false);

  function toggleList(key: FilterKey) {
    setExpandedLists((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <aside
      className={`flex h-full flex-col border border-white/8 bg-[#111214] text-[#e5e7eb] shadow-[12px_0_36px_rgba(0,0,0,0.18)] ${className}`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-24 md:pb-4">
        <section className="space-y-6">
          <div className="border border-white/8 bg-[#0d0d0e] p-0.5">
            <div className="grid grid-cols-2 gap-0.5">
              <button
                type="button"
                aria-pressed={mode === "schedule"}
                onClick={() => onModeChange("schedule")}
                className={`min-h-14 px-4 py-3 text-center text-[12px] font-medium transition duration-200 ease-out ${
                  mode === "schedule"
                    ? "bg-[#20390f] text-[#7ccf00]"
                    : "bg-[#090909] text-[#f3f4f6] hover:bg-[#111214]"
                }`}
              >
                Schedule
              </button>
              <button
                type="button"
                aria-pressed={mode === "lineup"}
                onClick={() => onModeChange("lineup")}
                className={`min-h-14 px-4 py-3 text-center text-[12px] font-medium transition duration-200 ease-out ${
                  mode === "lineup"
                    ? "bg-[#20390f] text-[#7ccf00]"
                    : "bg-[#090909] text-[#f3f4f6] hover:bg-[#111214]"
                }`}
              >
                Your lineup
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="max-w-[14ch] text-[15px] leading-8 text-[#a3a7ad]">
              {mode === "lineup"
                ? "Track your saved events and review them on the map."
                : "Build your week. Share when ready!"}
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-[#8f959d]">
                {mode === "lineup" ? `${savedCount} saved events` : `${resultCount} matching events`}
              </span>
              <button
                type="button"
                onClick={onClear}
                disabled={!hasActiveFilters}
                className={`inline-flex items-center gap-1 rounded-[0.35rem] border px-2.5 py-1.5 text-[12px] font-medium transition duration-200 ease-out ${
                  hasActiveFilters
                    ? "border-white/10 text-[#d4d8dd] hover:border-neon-green/40 hover:text-white"
                    : "cursor-not-allowed border-white/6 text-[#6f7580]"
                }`}
              >
                <X size={13} aria-hidden />
                Clear filters
              </button>
            </div>
          </div>

          <div className="border-t border-white/6" />

          <div className="space-y-4">
            <label className="group flex items-center gap-3 rounded-[0.35rem] border border-white/10 bg-[#1b1c1f] px-4 py-3 transition duration-200 ease-out focus-within:border-white/20 focus-within:bg-[#202226]">
              <Search
                size={16}
                className="text-[#8f959d] transition duration-200 ease-out group-focus-within:text-[#d9dde3]"
              />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#e5e7eb] outline-none placeholder:text-[#8f959d]"
              />
            </label>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-[#9ca3af]">
                Search featured events only
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={featuredOnly}
                onClick={() => setFeaturedOnly((current) => !current)}
                className={`relative h-8 w-14 rounded-full transition duration-200 ease-out ${
                  featuredOnly ? "bg-[#1f7a4d]" : "bg-[#26282c]"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-[#f3f4f6] transition duration-200 ease-out ${
                    featuredOnly ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-7 space-y-8">
          {filterSections.map((section) => {
            const isExpanded = expandedLists[section.key];
            const visibleValues = isExpanded
              ? section.values
              : section.values.slice(0, section.defaultLimit);

            return (
              <section key={section.key} className="space-y-4">
                <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#f3f4f6]">
                  {section.label}
                </h3>

                <div className="flex flex-wrap gap-3">
                  {visibleValues.map((value) => {
                    const isActive = activeFilters[section.key].includes(value);

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onToggleFilter(section.key, value)}
                        className={`rounded-[0.28rem] border px-3 py-1.5 text-[11px] font-medium transition duration-200 ease-out ${
                          isActive
                            ? "border-[#51725d] bg-[#213126] text-[#edf7ef]"
                            : "border-[#45484e] bg-[#2a2c30] text-[#c5c8ce] hover:bg-[#32353a]"
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
                    className="text-[12px] font-medium text-[#9ca3af] transition duration-200 ease-out hover:text-[#d8dde4]"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
