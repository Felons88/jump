import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Navigation, Package, Send, Truck, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { MapboxMap } from "@/components/routex/MapboxMap";
import { StopList } from "@/components/routex/StopList";
import { DispatchControls } from "@/components/routex/DispatchControls";
import {
  getEmployees,
  getRoutesForDate,
  optimizeRouteStops,
  type RouteStatus,
} from "@/data/routeXData";

export const Route = createFileRoute("/routex/routes/$id")({
  head: () => ({
    meta: [{ title: "RouteX Route Detail | Jump City" }],
  }),
  component: RouteDetailPage,
});

const STATUS_LABELS: Record<RouteStatus, string> = {
  draft: "Draft",
  optimized: "Optimized",
  dispatched: "Dispatched",
  "in-progress": "In progress",
  completed: "Completed",
};

function RouteDetailPage() {
  const { id } = Route.useParams();
  const [routes, setRoutes] = useState(() => getRoutesForDate(new Date()));
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const employees = getEmployees();

  const route = useMemo(() => routes.find((r) => r.id === id), [routes, id]);

  if (!route) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Truck className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-bold text-muted-foreground">Route not found</p>
          <Button asChild className="mt-4" variant="outline" size="sm">
            <Link to="/routex/routes">
              <ArrowLeft className="size-4" /> Back to Routes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== route.id) return r;
        const newStops = [...r.stops];
        const [moved] = newStops.splice(fromIndex, 1);
        if (moved) newStops.splice(toIndex, 0, moved);
        return {
          ...r,
          stops: newStops.map((s, i) => ({
            ...s,
            label: String.fromCharCode(65 + i),
            sequence: i + 1,
          })),
          geometryStale: true,
        };
      }),
    );
    toast.success("Stop order updated");
  };

  const handleDispatch = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== routeId) return r;
        const now = new Date();
        return {
          ...r,
          status: "dispatched" as const,
          dispatchedAt: now,
          assignments: r.assignments.map((a) => ({
            ...a,
            sendStatus: a.sendStatus === "not-sent" ? "sent" : a.sendStatus,
            sentAt: a.sentAt ?? now,
          })),
        };
      }),
    );
  };

  const handleReoptimize = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== routeId || r.stops.length === 0) return r;
        const { stops, totalMiles, totalDurationMin, geometry } = optimizeRouteStops(r.stops);
        return {
          ...r,
          stops,
          totalMiles,
          totalDurationMin,
          status: "optimized" as const,
          optimizedAt: new Date(),
          mapboxGeometry: geometry,
          geometryStale: false,
        };
      }),
    );
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/routex/routes">
            <ArrowLeft className="size-4" /> Routes
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full" style={{ background: route.color }} />
          <h2 className="text-lg font-extrabold">{route.vehicleLabel}</h2>
          <Badge variant="secondary" className="capitalize">
            {STATUS_LABELS[route.status]}
          </Badge>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Stops
              </p>
            </div>
            <p className="mt-1 font-display text-xl font-black">{route.stops.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Miles
              </p>
            </div>
            <p className="mt-1 font-display text-xl font-black">{route.totalMiles}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Duration
              </p>
            </div>
            <p className="mt-1 font-display text-xl font-black">{route.totalDurationMin} min</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Crew
              </p>
            </div>
            <p className="mt-1 font-display text-xl font-black">{route.assignments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Map + stop list */}
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="h-[400px] p-0">
            <MapboxMap
              routes={[route]}
              selectedRouteId={route.id}
              selectedStopId={selectedStopId}
              onSelectStop={setSelectedStopId}
              onSelectRoute={() => {}}
            />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <StopList
                stops={route.stops}
                routeColor={route.color}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
                onReorder={handleReorder}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Crew + dispatch */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Assigned Crew
            </p>
            <div className="space-y-2">
              {route.assignments.map((assignment) => {
                const emp = employees.find((e) => e.id === assignment.employeeId);
                if (!emp) return null;
                return (
                  <div
                    key={assignment.employeeId}
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-2"
                  >
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-black text-primary">
                      {emp.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "capitalize",
                        assignment.role === "lead"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-violet-100 text-violet-700",
                      )}
                    >
                      {assignment.role}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <DispatchControls
          route={route}
          onDispatch={handleDispatch}
          onReoptimize={handleReoptimize}
        />
      </div>
    </div>
  );
}
