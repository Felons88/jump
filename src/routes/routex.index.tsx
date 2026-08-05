import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Plus,
  Truck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { CadenceTimeline } from "@/components/routex/CadenceTimeline";
import { MapboxMap } from "@/components/routex/MapboxMap";
import {
  calculateMetrics,
  detectExceptions,
  getCadenceForDate,
  getRoutesForDate,
  optimizeRouteStops,
  type RouteException,
} from "@/data/routeXData";

export const Route = createFileRoute("/routex/")({
  head: () => ({
    meta: [{ title: "RouteX Overview | Jump City" }],
  }),
  loader: () => {
    const now = new Date();
    const routes = getRoutesForDate(now);
    return { now: now.toISOString(), routes };
  },
  component: OverviewPage,
});

function OverviewPage() {
  const { now, routes: initialRoutes } = Route.useLoaderData();
  const [selectedDate] = useState(new Date(now));
  const [routes, setRoutes] = useState(() => initialRoutes);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const cadence = useMemo(() => getCadenceForDate(new Date(now), new Date(now)), [now]);
  const metrics = useMemo(() => calculateMetrics(routes), [routes]);
  const exceptions = useMemo(() => detectExceptions(routes), [routes]);

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

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Top bar actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </p>
          <h2 className="text-lg font-extrabold">Today's Operations</h2>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleOptimizeAll}>
            <Navigation className="size-4" /> Optimize Today's Routes
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/routex/routes">
              <Truck className="size-4" /> View All Routes
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/routex/drivers">
              <Plus className="size-4" /> Add Employee
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Routes Today
            </p>
            <p className="mt-1 font-display text-xl font-black">{metrics.totalRoutes}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Total Stops
            </p>
            <p className="mt-1 font-display text-xl font-black">{metrics.totalStops}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Vehicles Active
            </p>
            <p className="mt-1 font-display text-xl font-black">
              {routes.filter((r) => r.status !== "draft").length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              On-Time %
            </p>
            <p className="mt-1 font-display text-xl font-black text-emerald-600">
              {metrics.onTimeRate}%
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Miles Planned
            </p>
            <p className="mt-1 font-display text-xl font-black">{metrics.totalMiles}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Mini map preview */}
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="h-[320px] p-0">
            <MapboxMap
              routes={routes}
              selectedRouteId={null}
              selectedStopId={selectedStopId}
              onSelectStop={setSelectedStopId}
              onSelectRoute={() => {}}
            />
          </CardContent>
          <div className="flex items-center justify-between border-t border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {routes.length} routes · {metrics.totalStops} stops on map
            </p>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/routex/live-map">
                Open Live Fleet Map <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Right column: cadence + alerts */}
        <div className="space-y-3">
          <CadenceTimeline stages={cadence} />

          {/* Alerts/exceptions */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border p-3">
              <AlertTriangle className="size-4 text-amber-600" />
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Alerts & Exceptions
              </p>
              {exceptions.length > 0 && (
                <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700">
                  {exceptions.length}
                </Badge>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {exceptions.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <CheckCircle2 className="size-6 text-emerald-600" />
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    All routes on schedule
                  </p>
                </div>
              ) : (
                exceptions.map((exc: RouteException) => (
                  <div
                    key={exc.id}
                    className={cn(
                      "flex items-start gap-2 border-b border-border/50 p-3 last:border-0",
                      exc.severity === "critical" && "bg-rose-50/50",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 size-2 shrink-0 rounded-full",
                        exc.severity === "critical" ? "bg-rose-500" : "bg-amber-500",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold">{exc.routeLabel}</p>
                      <p className="text-xs text-muted-foreground">{exc.message}</p>
                    </div>
                    <Link
                      to="/routex/routes"
                      className="shrink-0 text-[10px] font-bold text-primary hover:underline"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Live Fleet Map",
            icon: MapPin,
            to: "/routex/live-map",
            desc: "Real-time vehicle tracking",
          },
          {
            label: "Routes & Builder",
            icon: Truck,
            to: "/routex/routes",
            desc: "Plan and optimize routes",
          },
          {
            label: "Driver Roster",
            icon: Users,
            to: "/routex/drivers",
            desc: "Manage crew assignments",
          },
          {
            label: "Analytics",
            icon: CalendarIcon,
            to: "/routex/analytics",
            desc: "Performance metrics",
          },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
