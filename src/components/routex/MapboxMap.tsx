import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import { fetchRouteGeometry, hasMapboxToken } from "@/lib/routeOptimizer";
import {
  WAREHOUSE,
  type RouteGeometry,
  type RouteXRoute,
  type RouteXStop,
  type RouteStopStatus,
} from "@/data/routeXData";

const MAPBOX_TOKEN = import.meta.env["VITE_MAPBOX_TOKEN"] as string | undefined;

/* ── Status color mapping ───────────────────────────────────────────── */

const STATUS_COLORS: Record<RouteStopStatus, string> = {
  pending: "#94a3b8",
  "in-transit": "#f59e0b",
  delivered: "#22c55e",
  failed: "#ef4444",
};

const STATUS_LABELS: Record<RouteStopStatus, string> = {
  pending: "Pending",
  "in-transit": "En route",
  delivered: "Delivered",
  failed: "Failed",
};

/* ── Pin SVG marker builder ─────────────────────────────────────────── */

function createPinMarkerSVG(
  label: string,
  color: string,
  isSelected: boolean,
): { svg: string; w: number; h: number } {
  const w = isSelected ? 52 : 44;
  const h = isSelected ? 68 : 58;
  const cx = w / 2;
  const cy = h * 0.38;
  const r = h * 0.18;
  const stroke = isSelected ? 3 : 2.5;

  const shape = `M${cx} 0 C${w * 0.1} 0 0 ${h * 0.3} 0 ${h * 0.45} C0 ${h * 0.7} ${w * 0.3} ${h} ${cx} ${h} C${w * 0.7} ${h} ${w} ${h * 0.7} ${w} ${h * 0.45} C${w} ${h * 0.3} ${w * 0.9} 0 ${cx} 0 Z`;

  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35));">
  <path d="${shape}" fill="${color}" stroke="white" stroke-width="${stroke}" stroke-linejoin="round"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" opacity="0.95"/>
  <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central"
    font-family="Nunito, sans-serif" font-size="${isSelected ? 16 : 14}" font-weight="900" fill="${color}">${label}</text>
</svg>`;

  return { svg, w, h };
}

function createWarehouseMarkerSVG(): string {
  return `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));">
  <rect x="6" y="14" width="28" height="26" fill="#1e293b" stroke="white" stroke-width="2.5" rx="2"/>
  <path d="M4 14 L20 6 L36 14" fill="#334155" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="16" y="24" width="8" height="16" fill="white" opacity="0.7" rx="1"/>
  <rect x="9" y="18" width="5" height="5" fill="white" opacity="0.4" rx="0.5"/>
  <rect x="26" y="18" width="5" height="5" fill="white" opacity="0.4" rx="0.5"/>
</svg>`;
}

/* ── Component ──────────────────────────────────────────────────────── */

export function MapboxMap({
  routes,
  selectedRouteId,
  selectedStopId,
  onSelectStop,
  onSelectRoute,
}: {
  routes: RouteXRoute[];
  selectedRouteId: string | null;
  selectedStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onSelectRoute: (routeId: string) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const sourcesRef = useRef<Set<string>>(new Set());
  const layersRef = useRef<Set<string>>(new Set());
  const [mapReady, setMapReady] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const currentMarkers = markersRef.current;
    const currentSources = sourcesRef.current;
    const currentLayers = layersRef.current;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [WAREHOUSE.lng, WAREHOUSE.lat],
      zoom: 6,
    });

    map.on("load", () => {
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      currentMarkers.forEach((m) => m.remove());
      currentMarkers.length = 0;
      currentSources.clear();
      currentLayers.clear();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Fetch geometry for routes that don't have it yet
  useEffect(() => {
    if (!mapReady || !MAPBOX_TOKEN) return;
    for (const route of routes) {
      const needsGeometry =
        (route.mapboxGeometry === null || route.geometryStale) &&
        route.stops.length > 0 &&
        route.status !== "draft";
      if (needsGeometry) {
        void fetchRouteGeometry(
          { lng: WAREHOUSE.lng, lat: WAREHOUSE.lat },
          route.stops.map((s) => ({ lng: s.lng, lat: s.lat })),
          { lng: WAREHOUSE.lng, lat: WAREHOUSE.lat },
        ).then((geom: RouteGeometry | null) => {
          if (!geom || !mapRef.current) return;
          const sourceId = `route-src-${route.id}`;
          const map = mapRef.current;
          const existing = map.getSource(sourceId);
          if (existing) {
            (existing as mapboxgl.GeoJSONSource).setData({
              type: "Feature",
              properties: {},
              geometry: geom,
            });
          }
        });
      }
    }
  }, [routes, mapReady]);

  // Update markers and route lines when data changes or map becomes ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.length = 0;

    // Remove existing route layers/sources by tracked IDs
    layersRef.current.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    layersRef.current.clear();

    sourcesRef.current.forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });
    sourcesRef.current.clear();

    const visibleRoutes = selectedRouteId ? routes.filter((r) => r.id === selectedRouteId) : routes;

    const allCoords: [number, number][] = [[WAREHOUSE.lng, WAREHOUSE.lat]];

    for (const route of visibleRoutes) {
      const sourceId = `route-src-${route.id}`;
      const layerId = `route-${route.id}`;
      const dashLayerId = `route-dash-${route.id}`;

      const hasRealGeometry = route.mapboxGeometry !== null && !route.geometryStale;
      const isStale = route.geometryStale;
      const isDraft = route.status === "draft";

      if (hasRealGeometry && route.mapboxGeometry) {
        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route.mapboxGeometry,
          },
        });
        sourcesRef.current.add(sourceId);

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": route.color,
            "line-width": selectedRouteId === route.id ? 5 : 3,
            "line-opacity": selectedRouteId && selectedRouteId !== route.id ? 0.3 : 0.85,
          },
        });
        layersRef.current.add(layerId);
      } else if (isStale || isDraft) {
        const straightCoords: [number, number][] = [[WAREHOUSE.lng, WAREHOUSE.lat]];
        for (const stop of route.stops) {
          straightCoords.push([stop.lng, stop.lat]);
        }
        straightCoords.push([WAREHOUSE.lng, WAREHOUSE.lat]);

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: straightCoords,
            },
          },
        });
        sourcesRef.current.add(sourceId);

        map.addLayer({
          id: dashLayerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": route.color,
            "line-width": 2,
            "line-opacity": 0.5,
            "line-dasharray": [3, 3],
          },
        });
        layersRef.current.add(dashLayerId);
      }

      // Stop pins
      for (const stop of route.stops) {
        allCoords.push([stop.lng, stop.lat]);

        const isSelected = stop.id === selectedStopId;
        const { svg, w, h } = createPinMarkerSVG(stop.label, route.color, isSelected);

        const el = document.createElement("div");
        el.style.cssText = `position: absolute; display: flex; align-items: flex-end; justify-content: center; width: ${w}px; height: ${h}px; cursor: pointer;`;
        el.title = `Delivery for ${stop.customerName} — ${stop.address}, ${stop.city}, ${stop.state} ${stop.zip}`;

        const inner = document.createElement("div");
        inner.style.cssText = `display: flex; align-items: flex-end; justify-content: center; width: ${w}px; height: ${h}px; transition: transform 0.15s; transform: scale(${isSelected ? 1.12 : 1}); transform-origin: bottom center;`;
        inner.innerHTML = svg;
        el.appendChild(inner);

        const statusColor = STATUS_COLORS[stop.status];
        const statusLabel = STATUS_LABELS[stop.status];
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          `<div style="font-family: Nunito, sans-serif; min-width: 200px;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:${route.color}; color:white; font-size:11px; font-weight:900;">${stop.label}</span>
              <span style="font-weight:800; font-size:13px;">Order ${stop.label} — ${stop.customerName}</span>
            </div>
            <div style="font-size:12px; color:#666; margin-bottom:6px;">${stop.customerPhone}</div>
            <div style="font-size:11px; font-weight:700; color:#334155; margin-bottom:2px;">Bouncer</div>
            <div style="font-size:12px; color:#666; margin-bottom:4px;">${stop.itemName}</div>
            <div style="font-size:11px; font-weight:700; color:#334155; margin-bottom:2px;">Delivery address</div>
            <div style="font-size:12px; color:#666; margin-bottom:4px;">${stop.address}, ${stop.city}, ${stop.state} ${stop.zip}</div>
            <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${statusColor};"></span>
                ${statusLabel}
              </span>
              <span style="font-size:11px; color:${route.color}; font-weight:700;">ETA: ${stop.eta}</span>
            </div>
          </div>`,
        );

        const marker = new mapboxgl.Marker(el, { anchor: "bottom" })
          .setLngLat([stop.lng, stop.lat])
          .setPopup(popup)
          .addTo(map);
        if (isSelected) marker.togglePopup();

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectStop(stop.id);
          onSelectRoute(route.id);
          if (isSelected) marker.togglePopup();
        });

        markersRef.current.push(marker);
      }
    }

    // Warehouse marker
    const whEl = document.createElement("div");
    whEl.style.cssText =
      "position: absolute; display: flex; align-items: flex-end; justify-content: center; width: 40px; height: 40px; cursor: pointer;";
    whEl.title = WAREHOUSE.address;
    whEl.innerHTML = createWarehouseMarkerSVG();
    const whPopup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
      `<div style="font-family: Nunito, sans-serif;">
        <div style="font-weight:800; font-size:13px;">Depot / Warehouse</div>
        <div style="font-size:12px; color:#666;">${WAREHOUSE.address}</div>
      </div>`,
    );
    const whMarker = new mapboxgl.Marker(whEl, { anchor: "bottom" })
      .setLngLat([WAREHOUSE.lng, WAREHOUSE.lat])
      .setPopup(whPopup)
      .addTo(map);
    markersRef.current.push(whMarker);

    // Fit bounds to show all stops + warehouse
    allCoords.push([WAREHOUSE.lng, WAREHOUSE.lat]);
    if (allCoords.length > 1) {
      const bounds = allCoords.reduce(
        (b, coord) => b.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(allCoords[0]!, allCoords[1] ?? allCoords[0]!),
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 13 });
    }

    // Force a resize in case the container changed dimensions
    map.resize();
  }, [routes, selectedRouteId, selectedStopId, onSelectStop, onSelectRoute, mapReady]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <div ref={mapContainer} className="h-full w-full" />
      {!hasMapboxToken && (
        <MockMapView
          routes={routes}
          selectedStopId={selectedStopId}
          onSelectStop={onSelectStop}
          onSelectRoute={onSelectRoute}
        />
      )}
    </div>
  );
}

function MockMapView({
  routes,
  selectedStopId,
  onSelectStop,
  onSelectRoute,
}: {
  routes: RouteXRoute[];
  selectedStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onSelectRoute: (routeId: string) => void;
}) {
  const allStops = routes.flatMap((r) =>
    r.stops.map((s) => ({ ...s, routeId: r.id, color: r.color })),
  );
  const allPoints: { lng: number; lat: number }[] = [WAREHOUSE, ...allStops];
  const lats = allPoints.map((p) => p.lat);
  const lngs = allPoints.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const hasData = allStops.length > 0;

  const padX = hasData ? (maxLng - minLng) * 0.2 : 0.05;
  const padY = hasData ? (maxLat - minLat) * 0.2 : 0.05;
  const lngRange = Math.max(maxLng - minLng + 2 * padX, 0.001);
  const latRange = Math.max(maxLat - minLat + 2 * padY, 0.001);
  const viewL = minLng - padX;
  const viewT = maxLat + padY;

  const xPct = (lng: number) => ((lng - viewL) / lngRange) * 100;
  const yPct = (lat: number) => ((viewT - lat) / latRange) * 100;

  const aspectRatio = lngRange / latRange;

  return (
    <div className="absolute inset-0 z-10 overflow-hidden rounded-xl bg-[#e5e7eb]">
      <div
        className="absolute left-1/2 top-1/2 max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 bg-[#f8fafc]"
        style={{ aspectRatio }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {routes.map((route) => {
            if (route.stops.length === 0) return null;
            const pts = [WAREHOUSE, ...route.stops, WAREHOUSE]
              .map((p) => `${xPct(p.lng)},${yPct(p.lat)}`)
              .join(" ");
            return (
              <polyline
                key={`line-${route.id}`}
                points={pts}
                fill="none"
                stroke={route.color}
                strokeWidth={0.8}
                strokeOpacity={route.status === "draft" ? 0.5 : 0.85}
                strokeDasharray={route.status === "draft" ? "2,2" : undefined}
              />
            );
          })}
        </svg>

        <MarkerItem
          lng={WAREHOUSE.lng}
          lat={WAREHOUSE.lat}
          xPct={xPct}
          yPct={yPct}
          w={40}
          h={40}
          title={WAREHOUSE.address}
          onClick={() => {}}
        >
          <div
            className="flex h-full w-full items-end justify-center"
            dangerouslySetInnerHTML={{ __html: createWarehouseMarkerSVG() }}
          />
        </MarkerItem>

        {allStops.map((stop) => {
          const isSelected = stop.id === selectedStopId;
          const { svg, w, h } = createPinMarkerSVG(stop.label, stop.color, isSelected);
          return (
            <MarkerItem
              key={stop.id}
              lng={stop.lng}
              lat={stop.lat}
              xPct={xPct}
              yPct={yPct}
              w={w}
              h={h}
              title={`${stop.itemName} for ${stop.customerName} — ${stop.customerPhone} — ${stop.address}, ${stop.city}, ${stop.state} ${stop.zip}`}
              onClick={() => {
                onSelectStop(stop.id);
                onSelectRoute(stop.routeId);
              }}
            >
              <div
                className="flex h-full w-full items-end justify-center"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </MarkerItem>
          );
        })}
      </div>

      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-bold">No routes to display</p>
            <p className="text-xs text-muted-foreground">
              Add a route to see house pins on the map.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MarkerItem({
  lng,
  lat,
  xPct,
  yPct,
  w,
  h,
  title,
  onClick,
  children,
}: {
  lng: number;
  lat: number;
  xPct: (lng: number) => number;
  yPct: (lat: number) => number;
  w: number;
  h: number;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="absolute -translate-x-1/2 cursor-pointer p-0"
      style={{
        left: `${xPct(lng)}%`,
        top: `calc(${yPct(lat)}% - ${h}px)`,
        width: `${w}px`,
        height: `${h}px`,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
