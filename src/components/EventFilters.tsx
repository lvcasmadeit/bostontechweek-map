import { Filter, Search, X } from "lucide-react";
import filters from "@/src/data/filters.json";

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
}> = [
  { key: "topics", label: "Topics", values: filters.topics },
  { key: "neighborhoods", label: "Neighborhood", values: filters.neighborhoods },
  { key: "types", label: "Types", values: filters.types },
  { key: "startTimes", label: "Start time", values: filters.start_times },
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
  const activeCount = Object.values(activeFilters).reduce(
    (total, values) => total + values.length,
    0,
  );

  return (
    <aside
      className={`flex h-full flex-col border-dark-border bg-dark-panel/95 text-text-primary ${className}`}
    >
      <div className="border-b border-dark-border p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neon-green">
              Build your lineup
            </p>
            <h2 className="mt-1 text-xl font-extrabold uppercase tracking-[0.08em]">
              Filters
            </h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-tech border border-neon-green/30 bg-neon-green/10 text-neon-green shadow-neon-soft">
            <Filter size={18} aria-hidden />
          </div>
        </div>

        <label className="group flex items-center gap-3 rounded-tech border border-dark-border bg-black/35 px-3 py-2.5 transition focus-within:border-neon-green focus-within:shadow-neon-soft">
          <Search size={17} className="text-text-secondary group-focus-within:text-neon-green" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search BOS events"
            className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
          />
        </label>

        <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-text-secondary">
          <span>{resultCount} events</span>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 font-bold text-neon-green transition hover:text-neon-green-soft"
          >
            <X size={13} aria-hidden />
            Clear {activeCount ? `(${activeCount})` : ""}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 pb-24 md:pb-4">
        {filterSections.map((section) => (
          <section key={section.key}>
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-primary">
              {section.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {section.values.map((value) => {
                const isActive = activeFilters[section.key].includes(value);

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onToggleFilter(section.key, value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition duration-200 hover:-translate-y-px ${
                      isActive
                        ? "border-neon-green bg-neon-green text-black shadow-neon-soft"
                        : "border-white/10 bg-white/[0.04] text-text-secondary hover:border-neon-green/60 hover:text-neon-green"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
