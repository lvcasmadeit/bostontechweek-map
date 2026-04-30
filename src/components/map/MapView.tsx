"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import MapboxMap, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import type { GeoJSONSource } from "mapbox-gl";
import type { Feature, FeatureCollection, Point } from "geojson";
import eventsData from "@/src/data/events.json";
import { getSafeExternalUrl } from "@/src/lib/security";
import type { Event } from "@/src/types/events";

type MapViewProps = {
  className?: string;
  events?: Event[];
  onSelectEvent?: (eventId: string | null) => void;
  onToggleSave?: (eventId: string) => void;
  overlay?: ReactNode;
  savedEventIds?: Set<string>;
  selectedEventId?: string | null;
};

type EventFeatureProperties = {
  eventId: string;
  title: string;
};

type EventFeature = Feature<Point, EventFeatureProperties>;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || null;

const BOSTON_VIEW_STATE = {
  longitude: -71.0589,
  latitude: 42.3601,
  zoom: 11.4,
  pitch: 50,
  bearing: -14,
};

const EVENT_SOURCE_ID = "boston-tech-week-events";
const CLUSTER_LAYER_ID = "event-clusters";
const CLUSTER_COUNT_LAYER_ID = "event-cluster-count";
const UNCLUSTERED_LAYER_ID = "event-points";
const SELECTED_LAYER_ID = "selected-event-point";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

function formatEventTime(event: Event) {
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}${
    end ? ` - ${timeFormatter.format(end)}` : ""
  }`;
}

function createEventFeatureCollection(
  events: Event[],
): FeatureCollection<Point, EventFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: events.map((event) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [event.lng, event.lat],
      },
      properties: {
        eventId: event.id,
        title: event.title,
      },
    })),
  };
}

export function MapView({
  className = "",
  events: filteredEvents,
  onSelectEvent,
  onToggleSave,
  overlay,
  savedEventIds,
  selectedEventId,
}: MapViewProps) {
  const events = filteredEvents ?? (eventsData as Event[]);
  const mapRef = useRef<MapRef>(null);
  const previousSelectedIdRef = useRef<string | null>(null);

  const eventById = useMemo(() => {
    return new Map(events.map((event) => [event.id, event]));
  }, [events]);

  const geoJson = useMemo(() => createEventFeatureCollection(events), [events]);
  const selectedEvent = selectedEventId ? eventById.get(selectedEventId) ?? null : null;
  const safeRegistrationUrl = useMemo(
    () => getSafeExternalUrl(selectedEvent?.registrationUrl),
    [selectedEvent?.registrationUrl],
  );

  useEffect(() => {
    if (!selectedEvent) {
      previousSelectedIdRef.current = null;
      return;
    }

    const map = mapRef.current?.getMap();

    if (!map) {
      return;
    }

    const hasChanged = previousSelectedIdRef.current !== selectedEvent.id;
    previousSelectedIdRef.current = selectedEvent.id;

    if (!hasChanged) {
      return;
    }

    map.easeTo({
      center: [selectedEvent.lng, selectedEvent.lat],
      duration: 550,
      zoom: Math.max(map.getZoom(), 12.4),
    });
  }, [selectedEvent]);

  function handleMapClick(event: MapMouseEvent) {
    const feature = event.features?.[0] as
      | (EventFeature & {
          properties: EventFeatureProperties & {
            cluster?: boolean;
            cluster_id?: number;
          };
        })
      | undefined;

    if (!feature) {
      return;
    }

    if (feature.properties.cluster) {
      const map = mapRef.current?.getMap();
      const source = map?.getSource(EVENT_SOURCE_ID) as GeoJSONSource | undefined;
      const clusterId = feature.properties.cluster_id;

      if (!map || source === undefined || clusterId === undefined) {
        return;
      }

      source.getClusterExpansionZoom(clusterId, (error, zoom) => {
        if (error || zoom === null || zoom === undefined) {
          return;
        }

        const [longitude, latitude] = feature.geometry.coordinates;

        map.easeTo({
          center: [longitude, latitude],
          zoom,
          duration: 450,
        });
      });

      return;
    }

    onSelectEvent?.(feature.properties.eventId);
  }

  return (
    <section
      className={`relative min-h-[520px] overflow-hidden rounded-tech border border-dark-border bg-[#050805] shadow-panel-hard ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(10,10,10,0.28),transparent_24%,transparent_72%,rgba(10,10,10,0.34)),radial-gradient(circle_at_50%_30%,rgba(57,255,20,0.08),transparent_34%)]" />
      {overlay ? (
        <div className="absolute left-3 right-3 top-3 z-30 md:left-1/2 md:right-auto md:w-max md:max-w-[calc(100%-7rem)] md:-translate-x-1/2">
          {overlay}
        </div>
      ) : null}
      {MAPBOX_TOKEN ? (
        <MapboxMap
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={BOSTON_VIEW_STATE}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          interactiveLayerIds={[CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID]}
          onClick={handleMapClick}
          cursor="pointer"
          attributionControl={false}
          reuseMaps
          style={{ width: "100%", height: "100%", minHeight: "inherit" }}
        >
          <NavigationControl position="bottom-right" visualizePitch />

          <Source
            id={EVENT_SOURCE_ID}
            type="geojson"
            data={geoJson}
            cluster
            clusterMaxZoom={14}
            clusterRadius={52}
          >
            <Layer
              id={CLUSTER_LAYER_ID}
              type="circle"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#39ff14",
                  6,
                  "#67ff3d",
                  12,
                  "#a3ff4d",
                ],
                "circle-radius": ["step", ["get", "point_count"], 18, 6, 25, 12, 33],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#0a0a0a",
                "circle-opacity": 0.9,
                "circle-blur": 0.03,
              }}
            />
            <Layer
              id={CLUSTER_COUNT_LAYER_ID}
              type="symbol"
              filter={["has", "point_count"]}
              layout={{
                "text-field": ["get", "point_count_abbreviated"],
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12,
              }}
              paint={{
                "text-color": "#050505",
              }}
            />
            <Layer
              id={UNCLUSTERED_LAYER_ID}
              type="circle"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-color": "#39ff14",
                "circle-radius": [
                  "case",
                  ["==", ["get", "eventId"], selectedEventId ?? ""],
                  10,
                  7,
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#050805",
                "circle-opacity": 0.95,
                "circle-blur": 0,
              }}
            />
            <Layer
              id={SELECTED_LAYER_ID}
              type="circle"
              filter={[
                "all",
                ["!", ["has", "point_count"]],
                ["==", ["get", "eventId"], selectedEventId ?? ""],
              ]}
              paint={{
                "circle-color": "#39ff14",
                "circle-radius": 22,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#a3ff4d",
                "circle-opacity": 0.34,
                "circle-blur": 0.45,
              }}
            />
          </Source>

          {selectedEvent ? (
            <Popup
              longitude={selectedEvent.lng}
              latitude={selectedEvent.lat}
              anchor="bottom"
              closeButton
              closeOnClick={false}
              maxWidth="320px"
              offset={18}
              onClose={() => onSelectEvent?.(null)}
              className="tech-week-map-popup"
            >
              <div className="w-[260px] max-w-full overflow-hidden bg-black text-text-primary">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-neon-green">
                      {formatEventTime(selectedEvent)}
                    </p>
                    <h3 className="mt-2 break-words pr-1 text-sm font-black uppercase leading-tight">
                      {selectedEvent.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleSave?.(selectedEvent.id)}
                    aria-pressed={savedEventIds?.has(selectedEvent.id) ?? false}
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center border transition ${
                      savedEventIds?.has(selectedEvent.id)
                        ? "border-neon-green/50 bg-neon-green-muted text-neon-green"
                        : "border-white/10 text-text-secondary hover:border-neon-green/40 hover:text-neon-green"
                    }`}
                  >
                    {savedEventIds?.has(selectedEvent.id) ? (
                      <BookmarkCheck size={16} aria-hidden />
                    ) : (
                      <Bookmark size={16} aria-hidden />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold text-text-secondary">
                  {selectedEvent.neighborhood}
                </p>
                {safeRegistrationUrl ? (
                  <a
                    href={safeRegistrationUrl}
                    target="_blank"
                    rel="external noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="mt-3 inline-flex border border-neon-green/50 bg-neon-green px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-neon-green-soft"
                  >
                    View event
                  </a>
                ) : null}
              </div>
            </Popup>
          ) : null}
        </MapboxMap>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-md border border-amber-400/40 bg-black/80 p-4 text-center shadow-panel-hard backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
              Map unavailable
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable the interactive map.
              The event list remains available without shipping a fallback token.
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-[4.75rem] z-20 border border-neon-green/30 bg-black/78 px-3 py-2 shadow-neon-soft backdrop-blur md:top-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neon-green">
          Live Map
        </p>
        <p className="text-sm font-medium text-text-primary">
          Boston + Cambridge
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden border border-dark-border bg-black/70 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary backdrop-blur sm:block">
        <span className="text-neon-green">{events.length}</span> mapped events
      </div>
    </section>
  );
}
