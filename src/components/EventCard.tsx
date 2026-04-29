import { CalendarDays, MapPin, Ticket } from "lucide-react";
import type { Event } from "@/src/types/events";

type EventCardProps = {
  event: Event;
  isSelected: boolean;
  onSelect: (event: Event) => void;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function EventCard({ event, isSelected, onSelect }: EventCardProps) {
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;
  const accessLabel = event.isInviteOnly
    ? "Invite"
    : event.isFree
      ? "Free"
      : "Paid";

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={`group w-full rounded-tech border bg-dark-surface/85 p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-neon-green/70 hover:bg-[#232323] hover:shadow-neon-soft ${
        isSelected
          ? "border-neon-green shadow-neon-ring"
          : "border-dark-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neon-green">
            <CalendarDays size={14} aria-hidden />
            {dateFormatter.format(start)}
          </p>
          <h3 className="text-sm font-extrabold uppercase leading-tight text-text-primary transition group-hover:text-neon-green sm:text-base">
            {event.title}
          </h3>
        </div>
        <span className="shrink-0 border border-neon-green/30 bg-neon-green-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-neon-green">
          {accessLabel}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-text-secondary sm:grid-cols-[7.5rem_1fr]">
        <span>
          {timeFormatter.format(start)}
          {end ? ` - ${timeFormatter.format(end)}` : ""}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <MapPin size={14} className="shrink-0 text-neon-green" aria-hidden />
          <span className="truncate">
            {event.venue ?? event.neighborhood}, {event.neighborhood}
          </span>
        </span>
      </div>

      <p className="mt-3 overflow-hidden text-ellipsis text-xs leading-5 text-text-secondary [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
        {event.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {event.topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className="border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-text-primary"
          >
            {topic}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-text-secondary">
          <Ticket size={12} aria-hidden />
          {event.type}
        </span>
      </div>
    </button>
  );
}
