import fallbackEvents from "@/src/data/events.json";
import type { Event } from "@/src/types/events";

const TECH_WEEK_EVENTS_URL =
  "https://www.tech-week.com/calendar/api/trpc/calendar.events?batch=1";
const REVALIDATE_SECONDS = 15 * 60;
const DEFAULT_PER_PAGE = 48;

type TechWeekHost = {
  label?: unknown;
};

type TechWeekEvent = {
  id?: unknown;
  date?: unknown;
  time?: unknown;
  location?: unknown;
  name?: unknown;
  company?: unknown;
  externalHref?: unknown;
  isInviteOnly?: unknown;
  facets?: {
    hosts?: TechWeekHost[];
    locations?: Array<{ label?: unknown }>;
  };
};

type TechWeekEventsPage = {
  page: number;
  perPage: number;
  total: number;
  results: TechWeekEvent[];
};

const neighborhoodCoordinates: Record<string, { lat: number; lng: number }> = {
  Allston: { lat: 42.3555, lng: -71.1328 },
  "Back Bay": { lat: 42.3503, lng: -71.081 },
  "Bay Village": { lat: 42.3492, lng: -71.0686 },
  "Beacon Hill": { lat: 42.3588, lng: -71.0707 },
  Brighton: { lat: 42.3464, lng: -71.1627 },
  Brookline: { lat: 42.3318, lng: -71.1212 },
  Cambridge: { lat: 42.3656, lng: -71.1036 },
  Charlestown: { lat: 42.3782, lng: -71.0602 },
  Chelsea: { lat: 42.3918, lng: -71.0328 },
  Chinatown: { lat: 42.3501, lng: -71.0624 },
  Downtown: { lat: 42.3555, lng: -71.0605 },
  "East Boston": { lat: 42.3702, lng: -71.0389 },
  Everett: { lat: 42.4084, lng: -71.0537 },
  "Fenway-Kenmore": { lat: 42.3429, lng: -71.1003 },
  "Kendall Square": { lat: 42.3626, lng: -71.0843 },
  "North End": { lat: 42.3652, lng: -71.0542 },
  Roxbury: { lat: 42.3152, lng: -71.0914 },
  "Seaport District": { lat: 42.3505, lng: -71.0431 },
  Somerville: { lat: 42.3876, lng: -71.0995 },
  "South Boston": { lat: 42.3381, lng: -71.0476 },
  "South End": { lat: 42.3396, lng: -71.0746 },
  "Virtual (BOS)": { lat: 42.3601, lng: -71.0589 },
  Watertown: { lat: 42.3709, lng: -71.1828 },
  "West End": { lat: 42.3644, lng: -71.0661 },
};

function techWeekRequestBody(cursor: number) {
  return {
    "0": {
      city: "boston",
      q: "",
      featured: false,
      day: "all",
      track: [],
      sponsor: [],
      theme: [],
      format: [],
      location: [],
      time: [],
      host: [],
      sortBy: "time",
      sortOrder: "asc",
      cursor,
    },
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function createCoordinateJitter(id: string) {
  let hash = 0;

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }

  return {
    lat: (((hash % 100) / 100) - 0.5) * 0.011,
    lng: ((((hash >> 8) % 100) / 100) - 0.5) * 0.011,
  };
}

function getNeighborhood(event: TechWeekEvent) {
  const location = asString(event.location);
  const facetLocation = asString(event.facets?.locations?.[0]?.label);

  return location || facetLocation || "Virtual (BOS)";
}

function normalizeTechWeekEvent(event: TechWeekEvent): Event | null {
  const sourceId = String(event.id ?? "");
  const title = asString(event.name);
  const date = asString(event.date);
  const time = asString(event.time);

  if (!sourceId || !title || !date || !time) {
    return null;
  }

  const neighborhood = getNeighborhood(event);
  const coordinates =
    neighborhoodCoordinates[neighborhood] ?? neighborhoodCoordinates["Virtual (BOS)"];
  const jitter = createCoordinateJitter(sourceId);
  const hosts = event.facets?.hosts
    ?.map((host) => asString(host.label))
    .filter(Boolean);
  const host = hosts?.length ? hosts.join(", ") : asString(event.company) || "Tech Week";

  return {
    id: `tech-week-${sourceId}`,
    title,
    startTime: `${date}T${time}`,
    neighborhood,
    venue: neighborhood === "Virtual (BOS)" ? "Virtual Boston Tech Week event" : neighborhood,
    address: neighborhood === "Virtual (BOS)" ? "Online" : neighborhood,
    lat: coordinates.lat + jitter.lat,
    lng: coordinates.lng + jitter.lng,
    topics: ["Tech Week"],
    type: "Event",
    host,
    description: `${host} hosts ${title} during Boston Tech Week 2026.`,
    registrationUrl: asString(event.externalHref) || undefined,
    isFree: true,
    isInviteOnly: Boolean(event.isInviteOnly),
  };
}

async function fetchTechWeekEventsPage(cursor: number): Promise<TechWeekEventsPage> {
  const response = await fetch(TECH_WEEK_EVENTS_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(techWeekRequestBody(cursor)),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Tech Week events request failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const data = Array.isArray(payload)
    ? (payload[0] as { result?: { data?: TechWeekEventsPage } } | undefined)?.result?.data
    : undefined;

  if (!data || !Array.isArray(data.results)) {
    throw new Error("Tech Week events response was not in the expected shape");
  }

  return {
    page: Number(data.page) || cursor,
    perPage: Number(data.perPage) || DEFAULT_PER_PAGE,
    total: Number(data.total) || data.results.length,
    results: data.results,
  };
}

export async function getBostonTechWeekEvents(): Promise<Event[]> {
  try {
    const firstPage = await fetchTechWeekEventsPage(1);
    const pageCount = Math.ceil(firstPage.total / firstPage.perPage);
    const remainingPages = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
        fetchTechWeekEventsPage(index + 2),
      ),
    );
    const normalizedEvents = [firstPage, ...remainingPages]
      .flatMap((page) => page.results)
      .map(normalizeTechWeekEvent)
      .filter((event): event is Event => event !== null);

    if (!normalizedEvents.length) {
      throw new Error("Tech Week events response contained no usable events");
    }

    return normalizedEvents;
  } catch (error) {
    console.error(error);
    return fallbackEvents as Event[];
  }
}
