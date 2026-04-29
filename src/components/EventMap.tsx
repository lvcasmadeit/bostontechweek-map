import { MapPin } from "lucide-react";
import type { Event } from "@/src/types/events";

type EventMapProps = {
  events: Event[];
  selectedEvent: Event | null;
  onSelect: (event: Event) => void;
};

const bounds = {
  minLat: 42.32,
  maxLat: 42.39,
  minLng: -71.17,
  maxLng: -71.02,
};

function getMarkerPosition(event: Event) {
  const x =
    ((event.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y =
    ((bounds.maxLat - event.lat) / (bounds.maxLat - bounds.minLat)) * 100;

  return {
    left: `${Math.min(94, Math.max(6, x))}%`,
    top: `${Math.min(88, Math.max(10, y))}%`,
  };
}

export function EventMap({ events, selectedEvent, onSelect }: EventMapProps) {
  const activeEvent = selectedEvent ?? events[0] ?? null;

  return (
    <section className="relative min-h-[420px] overflow-hidden rounded-tech border border-dark-border bg-[#060706] shadow-2xl md:min-h-[calc(100vh-12rem)]">
      <div className="absolute inset-0 map-grid opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(163,255,77,0.16),transparent_28%),radial-gradient(circle_at_25%_70%,rgba(240,240,240,0.08),transparent_22%)]" />
      <div className="absolute left-[18%] top-[28%] h-px w-[66%] rotate-[-18deg] bg-neon-green/25 shadow-neon-soft" />
      <div className="absolute left-[12%] top-[62%] h-px w-[76%] rotate-[9deg] bg-white/10" />
      <div className="absolute left-[34%] top-0 h-full w-px rotate-[21deg] bg-white/10" />
      <div className="absolute left-[60%] top-0 h-full w-px rotate-[-10deg] bg-white/10" />

      <div className="absolute left-4 top-4 rounded-tech border border-neon-green/30 bg-black/70 px-3 py-2 backdrop-blur">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neon-green">
          Live Map
        </p>
        <p className="text-sm font-bold text-text-primary">
          Boston + Cambridge
        </p>
      </div>

      {events.map((event) => {
        const isSelected = activeEvent?.id === event.id;
        const position = getMarkerPosition(event);

        return (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event)}
            className={`absolute z-10 flex -translate-x-1/2 -translate-y-full items-center justify-center transition duration-200 hover:scale-110 ${
              isSelected ? "scale-110" : ""
            }`}
            style={position}
            aria-label={`Select ${event.title}`}
          >
            <span className="absolute h-9 w-9 rounded-full bg-neon-green/15 blur-md" />
            <span
              className={`relative flex h-8 w-8 items-center justify-center rounded-full border text-black shadow-neon-soft ${
                isSelected
                  ? "border-neon-green bg-neon-green"
                  : "border-neon-green/80 bg-neon-green-soft"
              }`}
            >
              <MapPin size={17} fill="currentColor" aria-hidden />
            </span>
          </button>
        );
      })}

      {activeEvent ? (
        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-tech border border-neon-green/40 bg-black/[0.82] p-4 shadow-neon-ring backdrop-blur md:left-auto md:w-[22rem]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neon-green">
            {activeEvent.neighborhood}
          </p>
          <h3 className="mt-1 text-lg font-extrabold uppercase leading-tight text-text-primary">
            {activeEvent.title}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            {activeEvent.venue} · {activeEvent.host}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeEvent.topics.slice(0, 2).map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] font-semibold text-text-primary"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
