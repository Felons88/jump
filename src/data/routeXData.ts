import { subDays, subHours, isSameDay, differenceInCalendarDays } from "date-fns";

import type { BookingRequest } from "@/data/mockBookings";
import { seedCustomers, seedEmployees, type Employee } from "@/data/seedData";

export type { Employee };

/* ── Types ──────────────────────────────────────────────────────────── */

export type RouteStopStatus = "pending" | "in-transit" | "delivered" | "failed";

export type RouteXStop = {
  id: string;
  sequence: number;
  label: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  itemName: string;
  deliveryWindow: string;
  instructions: string;
  eta: string;
  status: RouteStopStatus;
  lng: number;
  lat: number;
};

export type RouteStatus = "draft" | "optimized" | "dispatched" | "in-progress" | "completed";

export type StaffSendStatus = "not-sent" | "sent" | "opened" | "in-progress" | "completed";

export type StaffAssignment = {
  employeeId: string;
  role: "lead" | "helper";
  sendStatus: StaffSendStatus;
  sentAt: Date | null;
  openedAt: Date | null;
};

export type RouteGeometry = {
  coordinates: [number, number][];
  type: "LineString";
};

export type RouteXRoute = {
  id: string;
  vehicleLabel: string;
  color: string;
  leadId: string | null;
  assignments: StaffAssignment[];
  stops: RouteXStop[];
  totalMiles: number;
  totalDurationMin: number;
  status: RouteStatus;
  optimizedAt: Date | null;
  dispatchedAt: Date | null;
  /** Cached road-following geometry from Mapbox Directions/Optimization API */
  mapboxGeometry: RouteGeometry | null;
  /** True when stops have been reordered but geometry hasn't been recomputed yet */
  geometryStale: boolean;
};

export type CadenceStage = "draft-generated" | "rechecked" | "rebuilt" | "finalized" | "dispatched";

export type CadenceStatus = {
  stage: CadenceStage;
  label: string;
  completedAt: Date | null;
  description: string;
};

export type RouteXMetrics = {
  totalMiles: number;
  unoptimizedMiles: number;
  milesSaved: number;
  onTimeRate: number;
  avgStopsPerRoute: number;
  totalStops: number;
  totalRoutes: number;
};

export type RouteException = {
  id: string;
  routeId: string;
  routeLabel: string;
  type: "behind-schedule" | "window-at-risk" | "failed-optimization" | "undelivered";
  severity: "warning" | "critical";
  message: string;
  stopId?: string;
};

export type DriverPerformance = {
  employeeId: string;
  totalRoutes: number;
  totalStops: number;
  onTimeRate: number;
  avgStopDurationMin: number;
  totalMiles: number;
  completedRoutes: number;
};

export type VehiclePosition = {
  routeId: string;
  lng: number;
  lat: number;
  heading: number;
  speedMph: number;
  currentStopIndex: number;
  progress: number;
};

export type VehicleProfile = {
  id: string;
  label: string;
  capacity: number;
  available: boolean;
};

export type AnalyticsPoint = {
  date: Date;
  miles: number;
  onTimeRate: number;
  stops: number;
  routes: number;
};

export type DeliveryDensityPoint = {
  city: string;
  lng: number;
  lat: number;
  count: number;
};

export type CadenceConfig = {
  draftTime: string;
  recheckTime: string;
  rebuildTime: string;
  finalizeTime: string;
  dispatchTime: string;
  timezone: string;
};

/* ── Constants ──────────────────────────────────────────────────────── */

export const WAREHOUSE = {
  address: "1100 N 2nd St, Minneapolis, MN 55401",
  lng: -93.2732,
  lat: 44.9866,
};

export const ROUTE_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899"];

export const DEFAULT_CADENCE_CONFIG: CadenceConfig = {
  draftTime: "T-24h (auto)",
  recheckTime: "2:00 AM",
  rebuildTime: "5:30 AM",
  finalizeTime: "6:00 AM",
  dispatchTime: "6:30 AM",
  timezone: "America/Chicago",
};

export const VEHICLE_PROFILES: VehicleProfile[] = [
  { id: "v1", label: "Vehicle 1 — F-150", capacity: 4, available: true },
  { id: "v2", label: "Vehicle 2 — Transit", capacity: 6, available: true },
  { id: "v3", label: "Vehicle 3 — Sprinter", capacity: 5, available: false },
];

/* ── Mock coordinate offsets for Twin Cities area ───────────────────── */

const CITY_COORDS: Record<string, { lng: number; lat: number }> = {
  Minneapolis: { lng: -93.265, lat: 44.9776 },
  "St. Paul": { lng: -93.09, lat: 44.9537 },
  Bloomington: { lng: -93.313, lat: 44.8408 },
  "Maple Grove": { lng: -93.456, lat: 45.0721 },
  Woodbury: { lng: -92.958, lat: 44.9239 },
  Eagan: { lng: -93.167, lat: 44.8041 },
  Edina: { lng: -93.35, lat: 44.8797 },
  Plymouth: { lng: -93.455, lat: 45.0424 },
  Blaine: { lng: -93.234, lat: 45.1608 },
  "Coon Rapids": { lng: -93.288, lat: 45.12 },
  Lakeville: { lng: -93.243, lat: 44.6497 },
  Burnsville: { lng: -93.278, lat: 44.7678 },
  Duluth: { lng: -92.1065, lat: 46.7867 },
  "St. Cloud": { lng: -94.1711, lat: 45.5608 },
  Rochester: { lng: -92.4802, lat: 44.0121 },
  Mankato: { lng: -93.9999, lat: 44.1638 },
  Bemidji: { lng: -94.8803, lat: 47.4736 },
};

function coordsFor(city: string, zip: string, seed: number): { lng: number; lat: number } {
  const base = CITY_COORDS[city] ?? { lng: -93.2, lat: 44.98 };
  const n = (seed * 9301 + 49297) % 233280;
  const lastDigit = parseInt(zip.slice(-1)) || 0;
  const spread = 0.003 + (lastDigit % 9) * 0.0003;
  const angle = n * 2.4;
  const result = {
    lng: base.lng + Math.cos(angle) * spread,
    lat: base.lat + Math.sin(angle) * spread,
  };
  return result;
}

/* ── 5 mock stops spread across Minnesota ───────────────────────────── */

const MN_MOCK_STOPS: Omit<RouteXStop, "id" | "sequence" | "label" | "status" | "lng" | "lat">[] = [
  {
    customerName: "Anderson Family",
    customerEmail: "anderson@example.com",
    customerPhone: "(763) 555-0001",
    address: "1450 Lake Ave",
    city: "Duluth",
    state: "MN",
    zip: "55802",
    itemName: "Castle Bounce House",
    deliveryWindow: "Standard Delivery",
    instructions: "Driveway is on the left, place near garage.",
    eta: "8:00 AM",
  },
  {
    customerName: "Peterson Family",
    customerEmail: "peterson@example.com",
    customerPhone: "(763) 555-0002",
    address: "2200 College Dr",
    city: "St. Cloud",
    state: "MN",
    zip: "56301",
    itemName: "Water Slide Combo",
    deliveryWindow: "Event Day Delivery",
    instructions: "Backyard access through side gate.",
    eta: "9:30 AM",
  },
  {
    customerName: "Johnson Family",
    customerEmail: "johnson@example.com",
    customerPhone: "(763) 555-0003",
    address: "789 Main St",
    city: "Rochester",
    state: "MN",
    zip: "55901",
    itemName: "Obstacle Course",
    deliveryWindow: "1-Hour Window Delivery",
    instructions: "Front yard, flat surface confirmed.",
    eta: "11:00 AM",
  },
  {
    customerName: "Nelson Family",
    customerEmail: "nelson@example.com",
    customerPhone: "(763) 555-0004",
    address: "340 Oak Ave",
    city: "Mankato",
    state: "MN",
    zip: "56001",
    itemName: "Princess Castle",
    deliveryWindow: "Standard Delivery",
    instructions: "Place in backyard near fence.",
    eta: "12:30 PM",
  },
  {
    customerName: "Carlson Family",
    customerEmail: "carlson@example.com",
    customerPhone: "(763) 555-0005",
    address: "567 Birch Ln",
    city: "Bemidji",
    state: "MN",
    zip: "56601",
    itemName: "Fire Engine Bounce",
    deliveryWindow: "Event Day Delivery",
    instructions: "Lakefront property — use service road.",
    eta: "2:00 PM",
  },
];

function buildMnDemoRoute(): RouteXRoute {
  const stops: RouteXStop[] = MN_MOCK_STOPS.map((s, i) => {
    const { lng, lat } = coordsFor(s.city, s.zip, i);
    return {
      ...s,
      id: `mn-stop-${i}`,
      sequence: i + 1,
      label: String.fromCharCode(65 + i),
      status: "pending" as RouteStopStatus,
      lng,
      lat,
    };
  });

  const leadId = seedEmployees[0]?.id ?? null;
  const assignments: StaffAssignment[] = [];
  if (leadId) {
    assignments.push({
      employeeId: leadId,
      role: "lead",
      sendStatus: "not-sent",
      sentAt: null,
      openedAt: null,
    });
  }
  const helper = seedEmployees.find((e) => e.id !== leadId);
  if (helper) {
    assignments.push({
      employeeId: helper.id,
      role: "helper",
      sendStatus: "not-sent",
      sentAt: null,
      openedAt: null,
    });
  }

  const optimized = optimizeRouteStops(stops);

  return {
    id: "route-mn",
    vehicleLabel: "Vehicle 1 — MN Statewide",
    color: ROUTE_COLORS[0] ?? "#f97316",
    leadId,
    assignments,
    stops: optimized.stops,
    totalMiles: optimized.totalMiles,
    totalDurationMin: optimized.totalDurationMin,
    status: "optimized",
    optimizedAt: new Date(),
    dispatchedAt: null,
    mapboxGeometry: optimized.geometry,
    geometryStale: false,
  };
}

/* ── Generate routes for a given date ───────────────────────────────── */

function generateRoutesForDate(date: Date): RouteXRoute[] {
  const mnRoute = buildMnDemoRoute();

  const allBookings: (BookingRequest & {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  })[] = seedCustomers.flatMap((c) =>
    c.bookings.map((b) => ({
      ...b,
      customerName: c.name,
      customerEmail: c.email,
      customerPhone: c.phone,
    })),
  );

  const dayBookings = allBookings.filter((b) => isSameDay(b.eventDate, date));

  if (dayBookings.length === 0) {
    const nearby = allBookings
      .filter((b) => Math.abs(differenceInCalendarDays(b.eventDate, date)) <= 7)
      .slice(0, 8);
    if (nearby.length === 0) return [mnRoute];
    return [mnRoute, ...splitIntoRoutes(nearby)];
  }

  return [mnRoute, ...splitIntoRoutes(dayBookings)];
}

function splitIntoRoutes(
  bookings: (BookingRequest & {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  })[],
): RouteXRoute[] {
  const routeCount = Math.min(3, Math.max(1, Math.ceil(bookings.length / 4)));
  const routes: RouteXRoute[] = [];

  for (let r = 0; r < routeCount; r++) {
    const routeBookings = bookings.filter((_, i) => i % routeCount === r);
    if (routeBookings.length === 0) continue;

    const stops: RouteXStop[] = routeBookings.map((b, i) => {
      const { lng, lat } = coordsFor(b.address.city, b.address.zip, i);
      return {
        id: b.id,
        sequence: i + 1,
        label: String.fromCharCode(65 + i),
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        address: b.address.street,
        city: b.address.city,
        state: b.address.state,
        zip: b.address.zip,
        itemName: b.item.name,
        deliveryWindow: b.deliveryWindow,
        instructions: b.instructions || "Place near backyard, ensure flat surface.",
        eta: `${7 + i}:30 AM`,
        status: "pending" as RouteStopStatus,
        lng,
        lat,
      };
    });

    const optimized = optimizeRouteStops(stops);

    const leadId = seedEmployees[r % seedEmployees.length]?.id ?? null;
    const helperIds = seedEmployees
      .filter((e) => e.id !== leadId)
      .slice(r, r + 1)
      .map((e) => e.id);

    const assignments: StaffAssignment[] = [];
    if (leadId) {
      assignments.push({
        employeeId: leadId,
        role: "lead",
        sendStatus: "not-sent",
        sentAt: null,
        openedAt: null,
      });
    }
    helperIds.forEach((hid) => {
      assignments.push({
        employeeId: hid,
        role: "helper",
        sendStatus: "not-sent",
        sentAt: null,
        openedAt: null,
      });
    });

    routes.push({
      id: `route-${r}`,
      vehicleLabel: `Vehicle ${r + 1}`,
      color: ROUTE_COLORS[r % ROUTE_COLORS.length] ?? "#f97316",
      leadId,
      assignments,
      stops: optimized.stops,
      totalMiles: optimized.totalMiles,
      totalDurationMin: optimized.totalDurationMin,
      status: "optimized",
      optimizedAt: new Date(),
      dispatchedAt: null,
      mapboxGeometry: optimized.geometry,
      geometryStale: false,
    });
  }

  return routes;
}

/* ── Cadence simulation ─────────────────────────────────────────────── */

export function getCadenceForDate(date: Date, now = new Date()): CadenceStatus[] {
  const isToday = date.toDateString() === now.toDateString();
  const isPast = date < now;

  if (isPast) {
    return [
      {
        stage: "draft-generated",
        label: "Draft generated",
        completedAt: subHours(date, 24),
        description: "Initial route draft created",
      },
      {
        stage: "rechecked",
        label: "Rechecked",
        completedAt: subHours(date, 20),
        description: "Availability re-verified",
      },
      {
        stage: "rebuilt",
        label: "Rebuilt",
        completedAt: subHours(date, 6),
        description: "Final rebuild with latest bookings",
      },
      {
        stage: "finalized",
        label: "Finalized",
        completedAt: subHours(date, 4),
        description: "Routes locked for dispatch",
      },
      {
        stage: "dispatched",
        label: "Dispatched",
        completedAt: subHours(date, 3),
        description: "Sent to all assigned staff",
      },
    ];
  }

  if (isToday) {
    const hour = now.getHours();
    if (hour >= 7) {
      return [
        {
          stage: "draft-generated",
          label: "Draft generated",
          completedAt: subHours(now, 12),
          description: "Initial route draft created",
        },
        {
          stage: "rechecked",
          label: "Rechecked",
          completedAt: subHours(now, 8),
          description: "Availability re-verified",
        },
        {
          stage: "rebuilt",
          label: "Rebuilt",
          completedAt: subHours(now, 4),
          description: "Final rebuild with latest bookings",
        },
        {
          stage: "finalized",
          label: "Finalized",
          completedAt: subHours(now, 2),
          description: "Routes locked for dispatch",
        },
        {
          stage: "dispatched",
          label: "Dispatched",
          completedAt: subHours(now, 1),
          description: "Sent to all assigned staff",
        },
      ];
    }
    return [
      {
        stage: "draft-generated",
        label: "Draft generated",
        completedAt: subHours(now, 6),
        description: "Initial route draft created",
      },
      {
        stage: "rechecked",
        label: "Rechecked",
        completedAt: subHours(now, 3),
        description: "Availability re-verified",
      },
      {
        stage: "rebuilt",
        label: "Rebuilt",
        completedAt: null,
        description: "Final rebuild scheduled for 5:30 AM",
      },
      {
        stage: "finalized",
        label: "Finalized",
        completedAt: null,
        description: "Routes locked for dispatch",
      },
      {
        stage: "dispatched",
        label: "Dispatched",
        completedAt: null,
        description: "Sent to all assigned staff at 6:30 AM",
      },
    ];
  }

  return [
    {
      stage: "draft-generated",
      label: "Draft generated",
      completedAt: null,
      description: "Will be generated 24 hours before delivery date",
    },
    {
      stage: "rechecked",
      label: "Rechecked",
      completedAt: null,
      description: "Availability re-verification at 2:00 AM",
    },
    {
      stage: "rebuilt",
      label: "Rebuilt",
      completedAt: null,
      description: "Final rebuild at 5:30 AM",
    },
    {
      stage: "finalized",
      label: "Finalized",
      completedAt: null,
      description: "Routes locked at 6:00 AM",
    },
    {
      stage: "dispatched",
      label: "Dispatched",
      completedAt: null,
      description: "Sent to staff at 6:30 AM",
    },
  ];
}

export function getNextCadenceCountdown(cadence: CadenceStatus[]): string | null {
  const next = cadence.find((c) => c.completedAt === null);
  if (!next) return null;
  return next.description;
}

/* ── Metrics ────────────────────────────────────────────────────────── */

export function calculateMetrics(routes: RouteXRoute[]): RouteXMetrics {
  const totalMiles = routes.reduce((s, r) => s + r.totalMiles, 0);
  const totalStops = routes.reduce((s, r) => s + r.stops.length, 0);
  const unoptimizedMiles = totalMiles * 1.35;
  return {
    totalMiles: Math.round(totalMiles * 10) / 10,
    unoptimizedMiles: Math.round(unoptimizedMiles * 10) / 10,
    milesSaved: Math.round((unoptimizedMiles - totalMiles) * 10) / 10,
    onTimeRate: 94.2,
    avgStopsPerRoute: routes.length > 0 ? Math.round((totalStops / routes.length) * 10) / 10 : 0,
    totalStops,
    totalRoutes: routes.length,
  };
}

/* ── Exception detection ────────────────────────────────────────────── */

export function detectExceptions(routes: RouteXRoute[]): RouteException[] {
  const exceptions: RouteException[] = [];
  const now = new Date();
  const hour = now.getHours();

  for (const route of routes) {
    if ((route.status === "dispatched" || route.status === "in-progress") && hour >= 11) {
      const pending = route.stops.filter(
        (s) => s.status === "pending" || s.status === "in-transit",
      );
      if (pending.length > 0) {
        exceptions.push({
          id: `exc-behind-${route.id}`,
          routeId: route.id,
          routeLabel: route.vehicleLabel,
          type: "behind-schedule",
          severity: hour >= 13 ? "critical" : "warning",
          message: `${pending.length} stop(s) still undelivered by ${hour}:00`,
        });
      }
    }

    for (const stop of route.stops) {
      if (stop.status === "pending" && stop.deliveryWindow.includes("7:00") && hour >= 8) {
        exceptions.push({
          id: `exc-window-${stop.id}`,
          routeId: route.id,
          routeLabel: route.vehicleLabel,
          type: "window-at-risk",
          severity: "warning",
          message: `Stop ${stop.label} (${stop.customerName}) window at risk — ${stop.deliveryWindow}`,
          stopId: stop.id,
        });
      }
    }

    if (route.status === "draft" && hour >= 7) {
      exceptions.push({
        id: `exc-failopt-${route.id}`,
        routeId: route.id,
        routeLabel: route.vehicleLabel,
        type: "failed-optimization",
        severity: "warning",
        message: "Route not yet optimized — draft generated but not rebuilt",
      });
    }
  }

  return exceptions;
}

/* ── Driver performance ─────────────────────────────────────────────── */

export function getDriverPerformance(): DriverPerformance[] {
  return seedEmployees.map((emp, i) => ({
    employeeId: emp.id,
    totalRoutes: 15 + i * 4,
    totalStops: 45 + i * 12,
    onTimeRate: Math.round((96 - i * 2 + Math.random() * 2) * 10) / 10,
    avgStopDurationMin: 18 + i * 2,
    totalMiles: 120 + i * 35,
    completedRoutes: 13 + i * 3,
  }));
}

/* ── Vehicle position simulation ────────────────────────────────────── */

export function simulateVehiclePositions(routes: RouteXRoute[]): VehiclePosition[] {
  const positions: VehiclePosition[] = [];
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  for (const route of routes) {
    if (route.status === "draft" || route.status === "optimized") continue;
    if (route.stops.length === 0) continue;

    const startHour = 7;
    const elapsed = Math.max(0, hour - startHour);
    const totalDuration = route.stops.length * 0.5;
    const progress = Math.min(1, elapsed / totalDuration);

    if (progress <= 0) continue;

    const currentStopIndex = Math.min(
      route.stops.length - 1,
      Math.floor(progress * route.stops.length),
    );

    const currentStop = route.stops[currentStopIndex]!;
    const nextStop = route.stops[currentStopIndex + 1] ?? currentStop;
    const segmentProgress = (progress * route.stops.length) % 1;

    const lng = currentStop.lng + (nextStop.lng - currentStop.lng) * segmentProgress;
    const lat = currentStop.lat + (nextStop.lat - currentStop.lat) * segmentProgress;

    const dLng = nextStop.lng - currentStop.lng;
    const dLat = nextStop.lat - currentStop.lat;
    const heading = (Math.atan2(dLat, dLng) * 180) / Math.PI;

    positions.push({
      routeId: route.id,
      lng,
      lat,
      heading,
      speedMph: Math.round(25 + Math.random() * 15),
      currentStopIndex,
      progress,
    });
  }

  return positions;
}

/* ── Analytics data ─────────────────────────────────────────────────── */

export function getAnalyticsData(days = 30): {
  milesOverTime: AnalyticsPoint[];
  densityData: DeliveryDensityPoint[];
  driverComparison: DriverPerformance[];
  costSavings: { week: string; saved: number; total: number };
} {
  const milesOverTime: AnalyticsPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const routes = generateRoutesForDate(date);
    const metrics = calculateMetrics(routes);
    milesOverTime.push({
      date,
      miles: metrics.totalMiles,
      onTimeRate: Math.round((92 + Math.random() * 6) * 10) / 10,
      stops: metrics.totalStops,
      routes: metrics.totalRoutes,
    });
  }

  const cityCounts: Record<string, { lng: number; lat: number; count: number }> = {};
  for (const point of milesOverTime) {
    const routes = generateRoutesForDate(point.date);
    for (const route of routes) {
      for (const stop of route.stops) {
        const key = stop.city;
        if (!cityCounts[key]) {
          cityCounts[key] = { lng: stop.lng, lat: stop.lat, count: 0 };
        }
        cityCounts[key]!.count++;
      }
    }
  }

  const densityData: DeliveryDensityPoint[] = Object.entries(cityCounts).map(([city, data]) => ({
    city,
    lng: data.lng,
    lat: data.lat,
    count: data.count,
  }));

  return {
    milesOverTime,
    densityData,
    driverComparison: getDriverPerformance(),
    costSavings: {
      week: "This week",
      saved: Math.round(milesOverTime.slice(-7).reduce((s, p) => s + p.miles * 0.35 * 0.67, 0)),
      total: Math.round(milesOverTime.slice(-7).reduce((s, p) => s + p.miles * 0.67, 0)),
    },
  };
}

/* ── Local route optimization ───────────────────────────────────────── */

const EARTH_RADIUS_MILES = 3958.8;
const AVG_SPEED_MPH = 30;
const MINUTES_PER_STOP = 15;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const x = sinDLat * sinDLat + sinDLng * sinDLng * Math.cos(lat1) * Math.cos(lat2);
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function interpolateSegment(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  steps = 6,
): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);
    coords.push([a.lng + (b.lng - a.lng) * t, a.lat + (b.lat - a.lat) * t]);
  }
  return coords;
}

function buildMockGeometry(stops: { lat: number; lng: number }[]): RouteGeometry {
  const coords: [number, number][] = [[WAREHOUSE.lng, WAREHOUSE.lat]];
  let prev: { lat: number; lng: number } = WAREHOUSE;
  for (const stop of stops) {
    coords.push(...interpolateSegment(prev, stop));
    coords.push([stop.lng, stop.lat]);
    prev = stop;
  }
  coords.push(...interpolateSegment(prev, WAREHOUSE));
  coords.push([WAREHOUSE.lng, WAREHOUSE.lat]);
  return { type: "LineString", coordinates: coords };
}

function formatETA(totalMinutesFromMidnight: number): string {
  const h24 = Math.floor(totalMinutesFromMidnight / 60) % 24;
  const m = totalMinutesFromMidnight % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Solves a nearest-neighbor TSP from the warehouse and back, re-sequences
 * stops, recalculates distances, duration, and ETA labels. Works without
 * any external API so the optimization is always functional in demo mode.
 */
export function optimizeRouteStops(stops: RouteXStop[]): {
  stops: RouteXStop[];
  totalMiles: number;
  totalDurationMin: number;
  geometry: RouteGeometry;
} {
  const unvisited = [...stops];
  const optimized: RouteXStop[] = [];
  let current = { lat: WAREHOUSE.lat, lng: WAREHOUSE.lng };

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversineMiles(current, unvisited[i]!);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    }
    const [nearest] = unvisited.splice(nearestIndex, 1);
    if (nearest) {
      optimized.push(nearest);
      current = { lat: nearest.lat, lng: nearest.lng };
    }
  }

  let totalMiles = 0;
  let prev = { lat: WAREHOUSE.lat, lng: WAREHOUSE.lng };
  for (const stop of optimized) {
    totalMiles += haversineMiles(prev, stop);
    prev = { lat: stop.lat, lng: stop.lng };
  }
  totalMiles += haversineMiles(prev, WAREHOUSE);

  const startMinutes = 7 * 60; // 7:00 AM
  let cumulativeMin = 0;
  const resequenced = optimized.map((s, i) => {
    const from = i === 0 ? WAREHOUSE : optimized[i - 1]!;
    const legMiles = haversineMiles(from, s);
    const driveMin = (legMiles / AVG_SPEED_MPH) * 60;
    const serviceMin = i === 0 ? 0 : MINUTES_PER_STOP;
    cumulativeMin += Math.round(driveMin + serviceMin);
    return {
      ...s,
      sequence: i + 1,
      label: String.fromCharCode(65 + i),
      eta: formatETA(startMinutes + cumulativeMin),
    };
  });

  const drivingMin = (totalMiles / AVG_SPEED_MPH) * 60;
  const totalDurationMin = Math.round(drivingMin + resequenced.length * MINUTES_PER_STOP);

  return {
    stops: resequenced,
    totalMiles: Math.round(totalMiles * 10) / 10,
    totalDurationMin,
    geometry: buildMockGeometry(resequenced),
  };
}

/* ── Public API ─────────────────────────────────────────────────────── */

export function getRoutesForDate(date: Date): RouteXRoute[] {
  return generateRoutesForDate(date);
}

export function getEmployees(): Employee[] {
  return seedEmployees;
}
