import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Layers, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MapboxMap } from "@/components/routex/MapboxMap";
import {
  getRoutesForDate,
  simulateVehiclePositions,
  type RouteXRoute,
  type VehiclePosition,
} from "@/data/routeXData";

export const Route = createFileRoute("/routex/live-map")({
  head: () => ({
    meta: [{ title: "RouteX Live Fleet Map | Jump City" }],
  }),
  component: LiveMapPage,
});

function LiveMapPage() {
  const [routes] = useState<RouteXRoute[]>(() => getRoutesForDate(new Date()));
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [visibleRoutes, setVisibleRoutes] = useState<Set<string>>(new Set(routes.map((r) => r.id)));
  const [positions, setPositions] = useState<VehiclePosition[]>([]);

  // Simulate vehicle position updates
  useEffect(() => {
    const update = () => setPositions(simulateVehiclePositions(routes));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [routes]);

  const filteredRoutes = useMemo(
    () => routes.filter((r) => visibleRoutes.has(r.id)),
    [routes, visibleRoutes],
  );

  const toggleRoute = (id: string) => {
    setVisibleRoutes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Map — full screen */}
      <div className="relative flex-1">
        <MapboxMap
          routes={filteredRoutes}
          selectedRouteId={selectedRouteId}
          selectedStopId={selectedStopId}
          onSelectStop={setSelectedStopId}
          onSelectRoute={setSelectedRouteId}
        />

        {/* Layer toggle overlay */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-md">
          <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <Layers className="size-3" /> Layers
          </div>
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-muted"
          >
            {showCompleted ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            Completed stops
          </button>
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => toggleRoute(route.id)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-muted"
            >
              {visibleRoutes.has(route.id) ? (
                <Eye className="size-3.5" />
              ) : (
                <EyeOff className="size-3.5" />
              )}
              <div className="size-2.5 rounded-full" style={{ background: route.color }} />
              {route.vehicleLabel}
            </button>
          ))}
        </div>

        {/* Vehicle position badges */}
        {positions.length > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex gap-2">
            {positions.map((pos) => {
              const route = routes.find((r) => r.id === pos.routeId);
              if (!route) return null;
              return (
                <div
                  key={pos.routeId}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 shadow-md"
                >
                  <div className="size-2.5 rounded-full" style={{ background: route.color }} />
                  <span className="text-xs font-bold">{route.vehicleLabel}</span>
                  <span className="text-xs text-muted-foreground">{pos.speedMph} mph</span>
                  <span className="text-xs font-semibold text-primary">
                    {Math.round(pos.progress * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Panel toggle */}
        <button
          type="button"
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute left-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg border border-border bg-card shadow-md hover:bg-muted"
        >
          {panelOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      </div>

      {/* Collapsible side panel */}
      {panelOpen && (
        <div className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
          <div className="border-b border-border p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Fleet Status
            </p>
            <p className="mt-1 text-sm font-extrabold">
              {routes.length} routes · {positions.length} vehicles active
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {routes.map((route) => {
              const pos = positions.find((p) => p.routeId === route.id);
              const isSelected = selectedRouteId === route.id;
              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteId(isSelected ? null : route.id)}
                  className={cn(
                    "mb-2 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:bg-muted/30",
                  )}
                >
                  <div
                    className="mt-0.5 size-3 shrink-0 rounded-full"
                    style={{ background: route.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">{route.vehicleLabel}</p>
                      <span
                        className={cn(
                          "text-[10px] font-bold",
                          route.status === "dispatched" || route.status === "in-progress"
                            ? "text-emerald-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {route.status === "dispatched" || route.status === "in-progress"
                          ? "ACTIVE"
                          : route.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {route.stops.length} stops · {route.totalMiles} mi
                    </p>
                    {pos && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <Truck className="size-3 text-primary" />
                        <span className="text-[10px] font-semibold text-primary">
                          Stop {pos.currentStopIndex + 1}/{route.stops.length} · {pos.speedMph} mph
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
