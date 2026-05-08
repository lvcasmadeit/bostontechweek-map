import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setDesktopViewport } from "@/src/test/testEnv";
import type { Event } from "@/src/types/events";

const SAVED_LINEUP_STORAGE_KEY = "btw-2026-saved-lineup";
const tuesdayEventTitle = "Agents Meet at Boston 2026: Meet Your Next Partner";
const wednesdayEventTitle = "Legal AI Summit";
const savedEventId = "btw-2026-0005";

const testData = vi.hoisted(() => ({
  events: [
    {
      id: "btw-2026-0005",
      title: "Agents Meet at Boston 2026: Meet Your Next Partner",
      startTime: "2026-05-26T08:00:00",
      endTime: "2026-05-26T09:30:00",
      neighborhood: "Back Bay",
      venue: "Back Bay Tech Week venue",
      lat: 42.34474,
      lng: -71.076261,
      topics: ["AI"],
      type: "Matchmaking",
      host: "Walnut AI",
      description: "Find your next partner during Boston Tech Week.",
      registrationUrl: "https://partiful.com/e/tObYJoI36jOiZjIMukkQ",
      isFree: true,
      isInviteOnly: false,
    },
    {
      id: "btw-2026-1002",
      title: "Climate Builders Lunch",
      startTime: "2026-05-26T12:00:00",
      endTime: "2026-05-26T13:00:00",
      neighborhood: "Cambridge",
      venue: "Cambridge Tech Week venue",
      lat: 42.362179,
      lng: -71.104204,
      topics: ["Climate"],
      type: "Networking",
      host: "Green Future",
      description: "Lunch for founders building climate infrastructure.",
      registrationUrl: "https://example.com/climate-builders-lunch",
      isFree: true,
      isInviteOnly: false,
    },
    {
      id: "btw-2026-1003",
      title: "Legal AI Summit",
      startTime: "2026-05-27T14:00:00",
      endTime: "2026-05-27T15:30:00",
      neighborhood: "Back Bay",
      venue: "Back Bay Tech Week venue",
      lat: 42.350001,
      lng: -71.080001,
      topics: ["AI"],
      type: "Panel / Fireside Chat",
      host: "Lex Ventures",
      description: "Legal leaders discuss the next wave of AI policy.",
      registrationUrl: "https://example.com/legal-ai-summit",
      isFree: true,
      isInviteOnly: false,
    },
    {
      id: "btw-2026-1004",
      title: "Sunday Robotics Social",
      startTime: "2026-05-31T18:00:00",
      endTime: "2026-05-31T20:00:00",
      neighborhood: "Cambridge",
      venue: "MIT Museum",
      lat: 42.3625,
      lng: -71.088,
      topics: ["AI", "Climate"],
      type: "Networking",
      host: "Robotics Boston",
      description: "Close the week with a robotics meetup.",
      registrationUrl: "https://example.com/robotics-social",
      isFree: false,
      isInviteOnly: false,
    },
  ],
  filters: {
    topics: ["AI", "Climate"],
    neighborhoods: ["Back Bay", "Cambridge"],
    types: ["Matchmaking", "Networking", "Panel / Fireside Chat"],
    start_times: ["Morning", "Noon", "Afternoon", "Evening"],
  },
}));

const mapViewState = vi.hoisted(() => ({
  latestProps: null as {
    events: Event[];
    onSelectEvent?: (eventId: string | null) => void;
    onToggleSave?: (eventId: string) => void;
    savedEventIds?: Set<string>;
    selectedEventId?: string | null;
  } | null,
}));

vi.mock("@/src/data/events.json", () => ({
  default: testData.events,
}));

vi.mock("@/src/data/filters.json", () => ({
  default: testData.filters,
}));

vi.mock("@/src/components/map/MapView", () => ({
  MapView: (props: {
    events: Event[];
    onSelectEvent?: (eventId: string | null) => void;
    onToggleSave?: (eventId: string) => void;
    savedEventIds?: Set<string>;
    selectedEventId?: string | null;
  }) => {
    mapViewState.latestProps = props;
    const firstEvent = props.events[0];

    return (
      <div data-testid="mock-map-view">
        <p data-testid="map-selected-event">{props.selectedEventId ?? "none"}</p>
        <p data-testid="map-saved-count">{props.savedEventIds?.size ?? 0}</p>
        {firstEvent ? (
          <button type="button" onClick={() => props.onSelectEvent?.(firstEvent.id)}>
            Select first map event
          </button>
        ) : null}
      </div>
    );
  },
}));

const events = testData.events as Event[];

function getEventCard(title: string) {
  const heading = screen.getByText(title);
  const card = heading.closest("article");

  if (!card) {
    throw new Error(`Event card not found for ${title}`);
  }

  return card;
}

async function renderApp({
  desktop = false,
  storedLineup,
}: {
  desktop?: boolean;
  storedLineup?: string;
} = {}) {
  const { BostonTechWeekApp } = await import("@/src/components/BostonTechWeekApp");

  setDesktopViewport(desktop);

  if (storedLineup !== undefined) {
    window.localStorage.setItem(SAVED_LINEUP_STORAGE_KEY, storedLineup);
  }

  const user = userEvent.setup();

  render(<BostonTechWeekApp initialEvents={events} />);

  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
  });

  return { user };
}

describe("BostonTechWeekApp", () => {
  beforeEach(() => {
    mapViewState.latestProps = null;
  });

  it("switches between map and list views while keeping selection in sync", async () => {
    const { user } = await renderApp({ desktop: true });

    await user.click(screen.getByRole("button", { name: /select first map event/i }));
    await user.click(screen.getByRole("button", { name: /^list view$/i }));

    expect(screen.getByText(`Selected: ${tuesdayEventTitle}`)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /legal ai summit/i,
      }),
    );

    expect(screen.getByRole("button", { name: /^map view$/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /^list view$/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByTestId("map-selected-event")).toHaveTextContent("btw-2026-1003");
  });

  it("handles mobile filter, list, and lineup overlay transitions", async () => {
    const { user } = await renderApp();

    const mapButton = screen.getByRole("button", { name: /^map view$/i });
    const listButton = screen.getByRole("button", { name: /^list view$/i });
    const favoritesButton = screen.getByRole("button", { name: /^favorites$/i });
    const filtersButton = screen.getByRole("button", { name: /^filters/i });

    expect(mapButton).toHaveAttribute("aria-pressed", "true");
    expect(listButton).toHaveAttribute("aria-pressed", "false");
    expect(filtersButton).toHaveAttribute("aria-expanded", "false");

    await user.click(filtersButton);

    expect(filtersButton).toHaveAttribute("aria-expanded", "true");
    expect(mapButton).toHaveAttribute("aria-pressed", "true");

    await user.click(listButton);

    expect(listButton).toHaveAttribute("aria-pressed", "true");
    expect(filtersButton).toHaveAttribute("aria-expanded", "false");

    await user.click(filtersButton);

    expect(filtersButton).toHaveAttribute("aria-expanded", "true");
    expect(mapButton).toHaveAttribute("aria-pressed", "true");
    expect(listButton).toHaveAttribute("aria-pressed", "false");

    await user.click(favoritesButton);

    expect(favoritesButton).toHaveAttribute("aria-pressed", "true");
    expect(listButton).toHaveAttribute("aria-pressed", "true");
    expect(filtersButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/empty lineup/i)).toBeInTheDocument();
  });

  it("filters by search and multiple facets, then clears back to the full schedule", async () => {
    const { user } = await renderApp({ desktop: true });

    await user.click(screen.getByRole("button", { name: /^list view$/i }));

    const searchInput = screen.getByPlaceholderText("Search...");

    await user.type(searchInput, "Agents Meet");

    expect(screen.getByText("1 matching events")).toBeInTheDocument();
    expect(screen.getByText(tuesdayEventTitle)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "AI" }));
    await user.click(screen.getByRole("button", { name: "Back Bay" }));
    await user.click(screen.getByRole("button", { name: "Matchmaking" }));
    await user.click(screen.getByRole("button", { name: "Morning" }));

    expect(screen.getByText("1 matching events")).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, "zzzzz");

    expect(screen.getByText("0 matching events")).toBeInTheDocument();
    expect(screen.getByText(/no matches/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(searchInput).toHaveValue("");
    expect(screen.getByText(`${events.length} matching events`)).toBeInTheDocument();
    expect(screen.queryByText(/no matches/i)).not.toBeInTheDocument();
  });

  it("does not expose the removed featured-only filter toggle", async () => {
    await renderApp({ desktop: true });

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByText(/featured events only/i)).not.toBeInTheDocument();
  });

  it("filters by date tabs and restores the all-week view when filters are cleared", async () => {
    const { user } = await renderApp({ desktop: true });
    const wednesdayCount = events.filter(
      (event) => event.startTime.slice(0, 10) === "2026-05-27",
    ).length;
    const datePanel = document.getElementById("btw-date-panel");

    if (!datePanel) {
      throw new Error("Date panel not found");
    }

    await user.click(screen.getByRole("button", { name: /^list view$/i }));
    await user.click(within(datePanel).getByRole("button", { name: /^wed/i }));

    expect(screen.getByText(`${wednesdayCount} matching events`)).toBeInTheDocument();
    expect(screen.queryByText(tuesdayEventTitle)).not.toBeInTheDocument();
    expect(screen.getByText(wednesdayEventTitle)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(screen.getByText(`${events.length} matching events`)).toBeInTheDocument();
    expect(screen.getByText(tuesdayEventTitle)).toBeInTheDocument();
  });

  it("hydrates the lineup from storage, ignores invalid ids, and persists unsaves", async () => {
    const { user } = await renderApp({
      desktop: true,
      storedLineup: JSON.stringify([savedEventId, "missing-event", 42]),
    });

    await user.click(screen.getByRole("button", { name: /^favorites$/i }));

    expect(screen.getAllByText("1 saved events")).not.toHaveLength(0);
    expect(screen.getByText(tuesdayEventTitle)).toBeInTheDocument();
    expect(screen.queryByText(wednesdayEventTitle)).not.toBeInTheDocument();

    await user.click(
      within(getEventCard(tuesdayEventTitle)).getByRole("button", {
        name: /remove from lineup/i,
      }),
    );

    expect(screen.getByText(/empty lineup/i)).toBeInTheDocument();
    expect(window.localStorage.getItem(SAVED_LINEUP_STORAGE_KEY)).toBe("[]");
  });

  it("saves events from the schedule and keeps the lineup state synced with the map", async () => {
    const { user } = await renderApp({ desktop: true });

    await user.click(screen.getByRole("button", { name: /^list view$/i }));
    await user.click(
      within(getEventCard(tuesdayEventTitle)).getByRole("button", {
        name: /save to lineup/i,
      }),
    );

    expect(screen.getByTestId("map-saved-count")).toHaveTextContent("1");
    expect(window.localStorage.getItem(SAVED_LINEUP_STORAGE_KEY)).toContain(savedEventId);

    await user.click(screen.getByRole("button", { name: /^favorites$/i }));

    expect(screen.getAllByText("1 saved events")).not.toHaveLength(0);
    expect(screen.getByText(tuesdayEventTitle)).toBeInTheDocument();
    expect(screen.queryByText(wednesdayEventTitle)).not.toBeInTheDocument();
  });

  it("recovers gracefully from malformed saved-lineup storage", async () => {
    const { user } = await renderApp({
      desktop: true,
      storedLineup: "{not-valid-json",
    });

    await user.click(screen.getByRole("button", { name: /^favorites$/i }));

    expect(screen.getByText(/empty lineup/i)).toBeInTheDocument();
    expect(window.localStorage.getItem(SAVED_LINEUP_STORAGE_KEY)).toBe("[]");
  });
});
