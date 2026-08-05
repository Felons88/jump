import { ChevronRight, Clock, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RouteXRoute } from "@/data/routeXData";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  optimized: "Optimized",
  dispatched: "Dispatched",
  "in-progress": "In progress",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  optimized: "bg-sky-100 text-sky-700",
  dispatched: "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-amber-100 text-amber-700",
  completed: "bg-violet-100 text-violet-700",
};

export function RouteList({
  routes,
  selectedRouteId,
  onSelectRoute,
}: {
  routes: RouteXRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Routes ({routes.length})
        </p>
        {selectedRouteId && (
          <button
            type="button"
            onClick={() => onSelectRoute("all")}
            className="text-xs font-bold text-primary hover:underline"
          >
            Show all
          </button>
        )}
      </div>

      {routes.map((route) => {
        const isSelected = selectedRouteId === route.id;
        return (
          <button
            key={route.id}
            type="button"
            onClick={() => onSelectRoute(isSelected ? "all" : route.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30 hover:bg-muted/30",
            )}
          >
            <div
              className="mt-0.5 size-3 shrink-0 rounded-full"
              style={{ background: route.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{route.vehicleLabel}</p>
                <Badge
                  variant="secondary"
                  className={cn("text-[10px]", STATUS_COLORS[route.status])}
                >
                  {STATUS_LABELS[route.status] ?? route.status}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {route.stops.length} stops
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {route.totalMiles} mi
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {route.assignments.length}
                </span>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                isSelected && "rotate-90",
              )}
            />
          </button>
        );
      })}

      {routes.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
          <MapPin className="mx-auto size-6 text-muted-foreground/40" />
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            No routes for this date
          </p>
        </div>
      )}
    </div>
  );
}
