import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ChevronRight,
  Clock,
  GripVertical,
  MapPin,
  Navigation,
  Plus,
  Search,
  Truck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { MapboxMap } from "@/components/routex/MapboxMap";
import { StopList } from "@/components/routex/StopList";
import {
  getRoutesForDate,
  optimizeRouteStops,
  type RouteXRoute,
  type RouteStatus,
} from "@/data/routeXData";

export const Route = createFileRoute("/routex/routes")({
  head: () => ({
    meta: [{ title: "RouteX Routes | Jump City" }],
  }),
  component: RoutesPage,
});

const STATUS_LABELS: Record<RouteStatus, string> = {
  draft: "Draft",
  optimized: "Optimized",
  dispatched: "Dispatched",
  "in-progress": "In progress",
  completed: "Completed",
};

const STATUS_COLORS: Record<RouteStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  optimized: "bg-sky-100 text-sky-700",
  dispatched: "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-amber-100 text-amber-700",
  completed: "bg-violet-100 text-violet-700",
};

function RoutesPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [routes, setRoutes] = useState<RouteXRoute[]>(() => getRoutesForDate(new Date()));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RouteStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"vehicle" | "stops" | "miles" | "status">("vehicle");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const filteredRoutes = useMemo(() => {
    let result = routes;
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.vehicleLabel.toLowerCase().includes(q) ||
          r.stops.some(
            (s) => s.customerName.toLowerCase().includes(q) || s.city.toLowerCase().includes(q),
          ),
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "vehicle") cmp = a.vehicleLabel.localeCompare(b.vehicleLabel);
      else if (sortBy === "stops") cmp = a.stops.length - b.stops.length;
      else if (sortBy === "miles") cmp = a.totalMiles - b.totalMiles;
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [routes, search, statusFilter, sortBy, sortDir]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) ?? null;

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setRoutes(getRoutesForDate(date));
    setSelectedRouteId(null);
    setSelectedStopId(null);
  };

  const handleOptimizeAll = () => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.stops.length === 0) {
          return {
            ...r,
            status: "optimized" as const,
            optimizedAt: new Date(),
            geometryStale: false,
          };
        }
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
    toast.success(`${routes.length} route(s) optimized`);
  };

  const handleReorder = (routeId: string, fromIndex: number, toIndex: number) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== routeId) return r;
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

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Date
            </label>
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="mt-1 flex h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RouteStatus | "all")}
              className="mt-1 flex h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="optimized">Optimized</option>
              <option value="dispatched">Dispatched</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleOptimizeAll}>
            <Navigation className="size-4" /> Optimize All
          </Button>
          <Button
            size="sm"
            variant={showBuilder ? "default" : "outline"}
            onClick={() => setShowBuilder(!showBuilder)}
          >
            <Plus className="size-4" /> Route Builder
          </Button>
        </div>
      </div>

      {showBuilder ? (
        /* Route Builder split view */
        <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
          <Card className="overflow-hidden shadow-sm">
            <CardContent className="h-[500px] p-0">
              <MapboxMap
                routes={selectedRoute ? [selectedRoute] : routes}
                selectedRouteId={selectedRouteId}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
                onSelectRoute={setSelectedRouteId}
              />
            </CardContent>
          </Card>

          <div className="space-y-3">
            {selectedRoute ? (
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ background: selectedRoute.color }}
                    />
                    <p className="text-sm font-bold">{selectedRoute.vehicleLabel}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-7 px-2"
                      onClick={() => {
                        setSelectedRouteId(null);
                        setSelectedStopId(null);
                      }}
                    >
                      <X className="size-3" /> Close
                    </Button>
                  </div>
                  <StopList
                    stops={selectedRoute.stops}
                    routeColor={selectedRoute.color}
                    selectedStopId={selectedStopId}
                    onSelectStop={setSelectedStopId}
                    onReorder={(from, to) => handleReorder(selectedRoute.id, from, to)}
                  />
                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setRoutes((prev) =>
                          prev.map((r) => {
                            if (r.id !== selectedRoute.id || r.stops.length === 0) return r;
                            const { stops, totalMiles, totalDurationMin, geometry } =
                              optimizeRouteStops(r.stops);
                            return {
                              ...r,
                              stops,
                              totalMiles,
                              totalDurationMin,
                              status: "optimized",
                              optimizedAt: new Date(),
                              mapboxGeometry: geometry,
                              geometryStale: false,
                            };
                          }),
                        );
                        toast.success("Route re-optimized");
                      }}
                    >
                      <Navigation className="size-4" /> Re-optimize
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/routex/routes/$id" params={{ id: selectedRoute.id }}>
                        Details <ChevronRight className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <Truck className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm font-bold text-muted-foreground">
                    Select a route to edit
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click any route in the list below to open it in the builder
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : null}

      {/* Routes table */}
      <Card className="shadow-sm">
        <div className="flex items-center gap-3 border-b border-border p-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search routes, stops, cities…"
              className="h-8 pl-8 text-sm"
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {filteredRoutes.length} route(s)
          </span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_80px_100px_120px_40px] gap-2 border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <button
            type="button"
            onClick={() => handleSort("vehicle")}
            className="flex items-center gap-1 text-left"
          >
            Vehicle <ArrowUpDown className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => handleSort("stops")}
            className="flex items-center gap-1"
          >
            Stops <ArrowUpDown className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => handleSort("miles")}
            className="flex items-center gap-1"
          >
            Miles <ArrowUpDown className="size-3" />
          </button>
          <span>Driver</span>
          <button
            type="button"
            onClick={() => handleSort("status")}
            className="flex items-center gap-1"
          >
            Status <ArrowUpDown className="size-3" />
          </button>
          <span />
        </div>

        {/* Rows */}
        {filteredRoutes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          return (
            <button
              key={route.id}
              type="button"
              onClick={() => {
                setSelectedRouteId(isSelected ? null : route.id);
                setSelectedStopId(null);
                if (!showBuilder) setShowBuilder(true);
              }}
              className={cn(
                "grid w-full grid-cols-[1fr_80px_80px_100px_120px_40px] items-center gap-2 border-b border-border/50 px-3 py-2.5 text-left text-sm transition-colors last:border-0",
                isSelected ? "bg-primary/5" : "hover:bg-muted/30",
              )}
            >
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full" style={{ background: route.color }} />
                <span className="font-bold">{route.vehicleLabel}</span>
              </div>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-3" /> {route.stops.length}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-3" /> {route.totalMiles}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="size-3" /> {route.assignments.length}
              </span>
              <Badge
                variant="secondary"
                className={cn("w-fit text-[10px]", STATUS_COLORS[route.status])}
              >
                {STATUS_LABELS[route.status]}
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          );
        })}

        {filteredRoutes.length === 0 && (
          <div className="py-8 text-center">
            <Truck className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              No routes match your filters
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
