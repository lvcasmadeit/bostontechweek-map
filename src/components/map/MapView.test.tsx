import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-map-gl/mapbox", () => ({
  default: ({ children }: { children?: ReactNode }) => (
    <div data-testid="mock-mapbox-map">{children}</div>
  ),
  Layer: () => null,
  NavigationControl: () => null,
  Popup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Source: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

describe("MapView", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("shows a deterministic fallback when no public Mapbox token is available", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "");

    const { MapView } = await import("@/src/components/map/MapView");

    render(<MapView events={[]} />);

    expect(screen.getByText(/map unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/locations may not be accurate/i)).toBeInTheDocument();
    expect(
      screen.getByText(/NEXT_PUBLIC_MAPBOX_TOKEN/, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
});
