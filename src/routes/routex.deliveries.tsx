import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Clock, MapPin, Package, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  getRoutesForDate,
  type RouteStopStatus,
  type RouteXRoute,
  type RouteXStop,
} from "@/data/routeXData";

export const Route = createFileRoute("/routex/deliveries")({
  head: () => ({
    meta: [{ title: "RouteX Deliveries | Jump City" }],
  }),
  component: DeliveriesPage,
});

const STOP_STATUS_STYLES: Record<RouteStopStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  "in-transit": { label: "In transit", className: "bg-amber-100 text-amber-700" },
  delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Failed", className: "bg-rose-100 text-rose-700" },
};

type FlatStop = RouteXStop & {
  routeId: string;
  routeLabel: string;
  routeColor: string;
};

function DeliveriesPage() {
  const [routes] = useState<RouteXRoute[]>(() => getRoutesForDate(new Date()));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RouteStopStatus | "all">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [selectedStop, setSelectedStop] = useState<FlatStop | null>(null);

  const allStops: FlatStop[] = useMemo(
    () =>
      routes.flatMap((r) =>
        r.stops.map((s) => ({
          ...s,
          routeId: r.id,
          routeLabel: r.vehicleLabel,
          routeColor: r.color,
        })),
      ),
    [routes],
  );

  const cities = useMemo(() => [...new Set(allStops.map((s) => s.city))].sort(), [allStops]);

  const filtered = useMemo(() => {
    let result = allStops;
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (cityFilter !== "all") {
      result = result.filter((s) => s.city === cityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.customerName.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.itemName.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allStops, statusFilter, cityFilter, search]);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h2 className="text-lg font-extrabold">All Deliveries</h2>
        <p className="text-xs text-muted-foreground">
          {allStops.length} stops across {routes.length} routes
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, address, item…"
              className="h-8 pl-8 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RouteStopStatus | "all")}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In transit</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {(search || statusFilter !== "all" || cityFilter !== "all") && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCityFilter("all");
              }}
            >
              <X className="size-3" /> Clear
            </Button>
          )}
          <span className="ml-auto text-xs font-semibold text-muted-foreground">
            {filtered.length} result(s)
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_1fr_100px_100px_120px_100px_30px] gap-2 border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              <span />
              <span>Customer</span>
              <span>Address</span>
              <span>Item</span>
              <span>Window</span>
              <span>Route</span>
              <span>Status</span>
              <span />
            </div>

            {filtered.map((stop) => {
              const statusConfig = STOP_STATUS_STYLES[stop.status];
              const isSelected = selectedStop?.id === stop.id;
              return (
                <button
                  key={`${stop.routeId}-${stop.id}`}
                  type="button"
                  onClick={() => setSelectedStop(isSelected ? null : stop)}
                  className={cn(
                    "grid w-full grid-cols-[40px_1fr_1fr_100px_100px_120px_100px_30px] items-center gap-2 border-b border-border/50 px-3 py-2.5 text-left text-sm transition-colors last:border-0",
                    isSelected ? "bg-primary/5" : "hover:bg-muted/30",
                  )}
                >
                  <div
                    className="flex size-6 items-center justify-center rounded-full text-[10px] font-black text-white"
                    style={{ background: stop.routeColor }}
                  >
                    {stop.label}
                  </div>
                  <span className="truncate font-bold">{stop.customerName}</span>
                  <span className="truncate text-muted-foreground">
                    {stop.address}, {stop.city}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{stop.itemName}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {stop.deliveryWindow}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <div className="size-2 rounded-full" style={{ background: stop.routeColor }} />
                    {stop.routeLabel}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn("w-fit text-[10px]", statusConfig.className)}
                  >
                    {statusConfig.label}
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-8 text-center">
                <Package className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  No deliveries match your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stop detail drawer */}
      {selectedStop && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex size-8 items-center justify-center rounded-full text-xs font-black text-white"
                style={{ background: selectedStop.routeColor }}
              >
                {selectedStop.label}
              </div>
              <p className="text-sm font-bold">{selectedStop.customerName}</p>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-7 px-2"
                onClick={() => setSelectedStop(null)}
              >
                <X className="size-3" /> Close
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span>
                    {selectedStop.address}, {selectedStop.city}, {selectedStop.state}{" "}
                    {selectedStop.zip}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="size-3.5 text-muted-foreground" />
                  <span>{selectedStop.itemName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span>
                    {selectedStop.deliveryWindow} · ETA {selectedStop.eta}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <p className="text-muted-foreground">
                  <span className="font-bold text-foreground">Instructions: </span>
                  {selectedStop.instructions}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-bold text-foreground">Customer email: </span>
                  {selectedStop.customerEmail}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">Route: </span>
                  <Link
                    to="/routex/routes/$id"
                    params={{ id: selectedStop.routeId }}
                    className="font-bold text-primary hover:underline"
                  >
                    {selectedStop.routeLabel}
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
