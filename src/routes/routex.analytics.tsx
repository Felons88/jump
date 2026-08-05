import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  DollarSign,
  Download,
  Fuel,
  MapPin,
  Route as RouteIcon,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { MapboxMap } from "@/components/routex/MapboxMap";
import { getAnalyticsData, getRoutesForDate, type RouteXRoute } from "@/data/routeXData";

export const Route = createFileRoute("/routex/analytics")({
  head: () => ({
    meta: [{ title: "RouteX Analytics | Jump City" }],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const data = useMemo(() => getAnalyticsData(days), [days]);
  const [routes] = useState<RouteXRoute[]>(() => getRoutesForDate(new Date()));

  const maxMiles = Math.max(...data.milesOverTime.map((p) => p.miles), 1);
  const avgOnTime =
    data.milesOverTime.reduce((s, p) => s + p.onTimeRate, 0) / data.milesOverTime.length;
  const totalMiles = data.milesOverTime.reduce((s, p) => s + p.miles, 0);
  const totalStops = data.milesOverTime.reduce((s, p) => s + p.stops, 0);

  // Simple SVG chart dimensions
  const chartWidth = 800;
  const chartHeight = 200;
  const padding = 40;
  const chartW = chartWidth - padding * 2;
  const chartH = chartHeight - padding * 2;

  const milesPoints = data.milesOverTime.map((p, i) => {
    const x = padding + (i / (data.milesOverTime.length - 1)) * chartW;
    const y = padding + chartH - (p.miles / maxMiles) * chartH;
    return { x, y, ...p };
  });

  const onTimePoints = data.milesOverTime.map((p, i) => {
    const x = padding + (i / (data.milesOverTime.length - 1)) * chartW;
    const y = padding + chartH - ((p.onTimeRate - 85) / 15) * chartH;
    return { x, y, ...p };
  });

  const milesPath = milesPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const onTimePath = onTimePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const maxDensity = Math.max(...data.densityData.map((d) => d.count), 1);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Analytics & Reports</h2>
          <p className="text-xs text-muted-foreground">Last {days} days of delivery operations</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? "default" : "outline"}
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
          <Button size="sm" variant="outline">
            <Download className="size-4" /> Export
          </Button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Total Miles
              </p>
              <RouteIcon className="size-4 text-primary" />
            </div>
            <p className="mt-1 font-display text-xl font-black">{totalMiles}</p>
            <p className="text-[10px] text-muted-foreground">across {days} days</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                On-Time Rate
              </p>
              <TrendingUp className="size-4 text-emerald-600" />
            </div>
            <p className="mt-1 font-display text-xl font-black text-emerald-600">
              {avgOnTime.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">average</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Total Stops
              </p>
              <MapPin className="size-4 text-primary" />
            </div>
            <p className="mt-1 font-display text-xl font-black">{totalStops}</p>
            <p className="text-[10px] text-muted-foreground">deliveries completed</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Est. Fuel Savings
              </p>
              <Fuel className="size-4 text-emerald-600" />
            </div>
            <p className="mt-1 font-display text-xl font-black text-emerald-600">
              ${data.costSavings.saved}
            </p>
            <p className="text-[10px] text-muted-foreground">
              vs ${data.costSavings.total} unoptimized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Miles over time */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Miles Driven Over Time
            </p>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={padding}
                  y1={padding + t * chartH}
                  x2={padding + chartW}
                  y2={padding + t * chartH}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              ))}
              {/* Area fill */}
              <path
                d={`${milesPath} L ${padding + chartW} ${padding + chartH} L ${padding} ${padding + chartH} Z`}
                fill="hsl(var(--primary) / 0.1)"
              />
              {/* Line */}
              <path
                d={milesPath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Points */}
              {milesPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="hsl(var(--primary))">
                  <title>{`${format(p.date, "MMM d")}: ${p.miles} mi`}</title>
                </circle>
              ))}
              {/* X labels */}
              {milesPoints
                .filter((_, i) => i % Math.ceil(milesPoints.length / 6) === 0)
                .map((p, i) => (
                  <text
                    key={i}
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {format(p.date, "MMM d")}
                  </text>
                ))}
            </svg>
          </CardContent>
        </Card>

        {/* On-time rate trend */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              On-Time Delivery Rate Trend
            </p>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full">
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={padding}
                  y1={padding + t * chartH}
                  x2={padding + chartW}
                  y2={padding + t * chartH}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              ))}
              <path
                d={onTimePath}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {onTimePoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#22c55e">
                  <title>{`${format(p.date, "MMM d")}: ${p.onTimeRate}%`}</title>
                </circle>
              ))}
              {onTimePoints
                .filter((_, i) => i % Math.ceil(onTimePoints.length / 6) === 0)
                .map((p, i) => (
                  <text
                    key={i}
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {format(p.date, "MMM d")}
                  </text>
                ))}
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* Density heatmap + driver comparison */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Delivery density map */}
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="h-[350px] p-0">
            <MapboxMap
              routes={routes}
              selectedRouteId={null}
              selectedStopId={null}
              onSelectStop={() => {}}
              onSelectRoute={() => {}}
            />
          </CardContent>
          <div className="border-t border-border p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Delivery Density by City
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.densityData
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map((d) => (
                  <div
                    key={d.city}
                    className="flex items-center gap-1.5 rounded-lg border border-border/50 px-2 py-1"
                  >
                    <div
                      className="size-2 rounded-full"
                      style={{
                        background: `rgba(249, 115, 22, ${0.3 + (d.count / maxDensity) * 0.7})`,
                      }}
                    />
                    <span className="text-xs font-bold">{d.city}</span>
                    <span className="text-xs text-muted-foreground">{d.count}</span>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* Driver comparison */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Driver Performance Comparison
            </p>
            <div className="space-y-2">
              {data.driverComparison
                .sort((a, b) => b.onTimeRate - a.onTimeRate)
                .map((perf, i) => {
                  const emp = getAnalyticsData().driverComparison;
                  void emp;
                  return (
                    <div key={perf.employeeId} className="rounded-lg border border-border/50 p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold">
                            {perf.employeeId.replace("emp-", "Driver ")}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">
                          {perf.onTimeRate}%
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{perf.totalRoutes} routes</span>
                        <span>{perf.totalStops} stops</span>
                        <span>{perf.totalMiles} mi</span>
                      </div>
                      {/* Bar */}
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${perf.onTimeRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost savings breakdown */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="size-5 text-emerald-600" />
            <p className="text-sm font-bold">Estimated Cost Savings from Optimization</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Miles Saved
              </p>
              <p className="mt-1 font-display text-lg font-black text-emerald-600">
                {Math.round(totalMiles * 0.35)} mi
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Fuel Saved
              </p>
              <p className="mt-1 font-display text-lg font-black text-emerald-600">
                {Math.round(totalMiles * 0.35 * 0.04)} gal
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Fuel Cost Saved
              </p>
              <p className="mt-1 font-display text-lg font-black text-emerald-600">
                ${data.costSavings.saved}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Time Saved
              </p>
              <p className="mt-1 font-display text-lg font-black text-emerald-600">
                {Math.round(totalMiles * 0.35 * 1.5)} min
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
            <TrendingDown className="size-4 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Optimization reduces total miles by ~35% compared to unoptimized sequencing — saving
              an estimated ${data.costSavings.saved} in fuel costs over {days} days.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
