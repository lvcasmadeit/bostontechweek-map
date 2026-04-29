"use client";

import { useMemo, useRef, useState } from "react";
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
import type { Event } from "@/src/types/events";

type MapViewProps = {
  events: Event[];
  selectedEvent?: Event | null;
  onSelectEvent?: (event: Event) => void;
  className?: string;
};

type EventFeatureProperties = {
  eventId: string;
  title: string;
};

type EventFeature = Feature<Point, EventFeatureProperties>;

const DEFAULT_MAPBOX_TOKEN =
  "pk.eyJ1IjoibHZjYXNtYWRlaXQiLCJhIjoiY21vamo2aG05MDRqeTJ3b2xhZHcyMjVjOCJ9.R3VRtBCpMFxZxNkNgax3aA";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? DEFAULT_MAPBOX_TOKEN;

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
  events,
  selectedEvent,
  onSelectEvent,
  className = "",
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupEvent, setPopupEvent] = useState<Event | null>(
    selectedEvent ?? events[0] ?? null,
  );

  const eventById = useMemo(() => {
    return new Map(events.map((event) => [event.id, event]));
  }, [events]);

  const geoJson = useMemo(() => createEventFeatureCollection(events), [events]);

  const selectedEventId = selectedEvent?.id ?? popupEvent?.id ?? "";
  const activePopupEvent =
    (selectedEventId ? eventById.get(selectedEventId) : null) ??
    popupEvent ??
    null;

  function handleMarkerSelect(event: Event) {
    setPopupEvent(event);
    onSelectEvent?.(event);
  }

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

    const selected = eventById.get(feature.properties.eventId);

    if (selected) {
      handleMarkerSelect(selected);
    }
  }

  return (
    <section
      className={`relative min-h-[520px] overflow-hidden rounded-tech border border-dark-border bg-[#050805] shadow-panel-hard md:min-h-[calc(100vh-10rem)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(10,10,10,0.28),transparent_24%,transparent_72%,rgba(10,10,10,0.34)),radial-gradient(circle_at_50%_30%,rgba(57,255,20,0.08),transparent_34%)]" />
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
        <NavigationControl position="top-right" visualizePitch />

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
                ["==", ["get", "eventId"], selectedEventId],
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
              ["==", ["get", "eventId"], selectedEventId],
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

        {activePopupEvent ? (
          <Popup
            longitude={activePopupEvent.lng}
            latitude={activePopupEvent.lat}
            anchor="bottom"
            closeButton
            closeOnClick={false}
            offset={18}
            onClose={() => setPopupEvent(null)}
            className="tech-week-map-popup"
          >
            <div className="min-w-[230px] max-w-[290px] bg-black text-text-primary">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-neon-green">
                {formatEventTime(activePopupEvent)}
              </p>
              <h3 className="mt-2 text-sm font-black uppercase leading-tight">
                {activePopupEvent.title}
              </h3>
              <p className="mt-2 text-xs font-semibold text-text-secondary">
                {activePopupEvent.neighborhood}
              </p>
              {activePopupEvent.registrationUrl ? (
                <a
                  href={activePopupEvent.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex border border-neon-green/50 bg-neon-green px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-neon-green-soft"
                >
                  View event
                </a>
              ) : null}
            </div>
          </Popup>
        ) : null}
      </MapboxMap>

      <div className="pointer-events-none absolute left-4 top-4 z-20 border border-neon-green/30 bg-black/78 px-3 py-2 shadow-neon-soft backdrop-blur">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neon-green">
          Live Map
        </p>
        <p className="text-sm font-bold text-text-primary">
          Boston + Cambridge
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden border border-dark-border bg-black/70 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary backdrop-blur sm:block">
        <span className="text-neon-green">{events.length}</span> mapped events
      </div>
    </section>
  );
}
