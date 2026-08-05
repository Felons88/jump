import { Gauge, MapPin, Route, TrendingDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { RouteXMetrics } from "@/data/routeXData";

export function RouteXMetrics({ metrics }: { metrics: RouteXMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Miles Saved
            </p>
            <TrendingDown className="size-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 font-display text-xl font-black text-emerald-600">
            {metrics.milesSaved} mi
          </p>
          <p className="text-[10px] text-muted-foreground">
            vs {metrics.unoptimizedMiles} mi unoptimized
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              On-Time Rate
            </p>
            <Gauge className="size-4 text-primary" />
          </div>
          <p className="mt-1.5 font-display text-xl font-black">{metrics.onTimeRate}%</p>
          <p className="text-[10px] text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Stops / Route
            </p>
            <MapPin className="size-4 text-primary" />
          </div>
          <p className="mt-1.5 font-display text-xl font-black">{metrics.avgStopsPerRoute}</p>
          <p className="text-[10px] text-muted-foreground">
            {metrics.totalStops} stops across {metrics.totalRoutes} routes
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Total Miles
            </p>
            <Route className="size-4 text-primary" />
          </div>
          <p className="mt-1.5 font-display text-xl font-black">{metrics.totalMiles} mi</p>
          <p className="text-[10px] text-muted-foreground">Today's planned routes</p>
        </CardContent>
      </Card>
    </div>
  );
}
