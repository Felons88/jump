/**
 * Mapbox Optimization API integration for RouteX delivery routing.
 * Uses VITE_MAPBOX_TOKEN for both map rendering and route optimization.
 */

const MAPBOX_TOKEN = import.meta.env["VITE_MAPBOX_TOKEN"] as string | undefined;

export const hasMapboxToken = Boolean(MAPBOX_TOKEN);

export type RouteStop = {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  customerName: string;
  itemName: string;
  window: string;
  lng?: number;
  lat?: number;
};

export type OptimizedRoute = {
  stops: RouteStop[];
  totalDistance: string;
  totalDuration: string;
  legs: { distance: string; duration: string }[];
  geometry: { coordinates: [number, number][]; type: "LineString" } | null;
  order: number[];
};

type MapboxOptimizationResponse = {
  code?: string;
  message?: string;
  trips?: {
    distance?: number;
    duration?: number;
    geometry?: { coordinates: [number, number][]; type: "LineString" };
    legs?: {
      distance?: number;
      duration?: number;
    }[];
  }[];
  waypoints?: { waypoint_index?: number; location?: [number, number] }[];
};

/**
 * Calls the Mapbox Optimization API to solve a multi-stop delivery route.
 */
export async function optimizeRoute(
  origin: { lng: number; lat: number },
  stops: RouteStop[],
  destination?: { lng: number; lat: number },
): Promise<OptimizedRoute | null> {
  if (!MAPBOX_TOKEN || stops.length === 0) return null;

  const dest = destination ?? origin;
  const coordinates = [
    `${origin.lng},${origin.lat}`,
    ...stops
      .filter((s) => s.lng !== undefined && s.lat !== undefined)
      .map((s) => `${s.lng},${s.lat}`),
    `${dest.lng},${dest.lat}`,
  ].join(";");

  const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?annotations=duration,distance&overview=full&access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mapbox API returned ${res.status}`);
    const data = (await res.json()) as MapboxOptimizationResponse;

    const trip = data.trips?.[0];
    if (data.code !== "Ok" || !trip) {
      console.error("[mapbox] Optimization API error:", data.code, data.message);
      return null;
    }

    const totalMeters = trip.distance ?? 0;
    const totalSeconds = trip.duration ?? 0;
    const legs =
      trip.legs?.map((leg) => ({
        distance: leg.distance ? `${(leg.distance / 1609.34).toFixed(1)} mi` : "Unknown",
        duration: leg.duration ? `${Math.round(leg.duration / 60)} min` : "Unknown",
      })) ?? [];

    const waypoints = data.waypoints ?? [];
    const order: number[] = [];
    for (let i = 1; i < waypoints.length - 1; i++) {
      const wp = waypoints[i];
      if (wp?.waypoint_index !== undefined) {
        order.push(wp.waypoint_index);
      }
    }
    const optimizedStops = order.map((i) => stops[i]).filter((s): s is RouteStop => Boolean(s));

    return {
      stops: optimizedStops.length > 0 ? optimizedStops : stops,
      totalDistance: totalMeters > 0 ? `${(totalMeters / 1609.34).toFixed(1)} mi` : "Unknown",
      totalDuration: totalSeconds > 0 ? `${Math.round(totalSeconds / 60)} min` : "Unknown",
      legs,
      geometry: trip.geometry ?? null,
      order: order.length > 0 ? order : stops.map((_, i) => i),
    };
  } catch (err) {
    console.error("[mapbox] Route optimization failed:", err);
    return null;
  }
}

/**
 * Generates a simple mock geometry line between stops for display
 * when the Mapbox API isn't available.
 */
export function mockRouteGeometry(
  origin: { lng: number; lat: number },
  stops: { lng: number; lat: number }[],
): { coordinates: [number, number][]; type: "LineString" } {
  const coords: [number, number][] = [[origin.lng, origin.lat]];
  for (const s of stops) {
    coords.push([s.lng, s.lat]);
  }
  coords.push([origin.lng, origin.lat]);
  return { coordinates: coords, type: "LineString" };
}

type MapboxDirectionsResponse = {
  code?: string;
  message?: string;
  routes?: {
    geometry?: { coordinates: [number, number][]; type: "LineString" };
    distance?: number;
    duration?: number;
  }[];
};

/**
 * Fetches real road-following route geometry from the Mapbox Directions API.
 * Returns a GeoJSON LineString geometry or null on failure.
 *
 * Uses the walking/driving profile to get actual road paths.
 */
export async function fetchRouteGeometry(
  origin: { lng: number; lat: number },
  stops: { lng: number; lat: number }[],
  destination?: { lng: number; lat: number },
): Promise<{ coordinates: [number, number][]; type: "LineString" } | null> {
  if (!MAPBOX_TOKEN || stops.length === 0) return null;

  const dest = destination ?? origin;
  const coordinates = [
    `${origin.lng},${origin.lat}`,
    ...stops.map((s) => `${s.lng},${s.lat}`),
    `${dest.lng},${dest.lat}`,
  ].join(";");

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?overview=full&geometries=geojson&access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mapbox Directions API returned ${res.status}`);
    const data = (await res.json()) as MapboxDirectionsResponse;

    if (data.code !== "Ok" || !data.routes?.[0]?.geometry) {
      console.error("[mapbox] Directions API error:", data.code, data.message);
      return null;
    }

    return data.routes[0].geometry;
  } catch (err) {
    console.error("[mapbox] Route geometry fetch failed:", err);
    return null;
  }
}
