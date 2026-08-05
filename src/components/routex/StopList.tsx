import { Clock, GripVertical, MapPin, Package } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RouteXStop, RouteStopStatus } from "@/data/routeXData";

const STOP_STATUS_STYLES: Record<RouteStopStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  "in-transit": { label: "In transit", className: "bg-amber-100 text-amber-700" },
  delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Failed", className: "bg-rose-100 text-rose-700" },
};

export function StopList({
  stops,
  routeColor,
  selectedStopId,
  onSelectStop,
  onReorder,
}: {
  stops: RouteXStop[];
  routeColor: string;
  selectedStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      onReorder(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  if (stops.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
        <Package className="mx-auto size-6 text-muted-foreground/40" />
        <p className="mt-2 text-xs font-semibold text-muted-foreground">No stops in this route</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Stop List ({stops.length})
      </p>
      {stops.map((stop, i) => {
        const isSelected = stop.id === selectedStopId;
        const isDragOver = dragOverIndex === i;
        const statusConfig = STOP_STATUS_STYLES[stop.status];
        return (
          <div
            key={stop.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            onClick={() => onSelectStop(stop.id)}
            className={cn(
              "group flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 transition-all",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30 hover:bg-muted/30",
              isDragOver && "border-primary border-t-2",
            )}
          >
            <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground/40 opacity-0 group-hover:opacity-100" />

            {/* Lettered pin */}
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
              style={{ background: routeColor }}
            >
              {stop.label}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold">{stop.customerName}</p>
                <Badge
                  variant="secondary"
                  className={cn("shrink-0 text-[10px]", statusConfig.className)}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="size-3" />
                <span className="truncate">{stop.itemName}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span className="truncate">
                  {stop.address}, {stop.city}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                  <Clock className="size-3" />
                  {stop.deliveryWindow}
                </span>
                <span className="font-bold" style={{ color: routeColor }}>
                  ETA {stop.eta}
                </span>
              </div>
              {stop.instructions && (
                <p className="mt-1 truncate text-[11px] italic text-muted-foreground">
                  {stop.instructions}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
