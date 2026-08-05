import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Clock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Route as RouteIcon,
  Search,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  getDriverPerformance,
  getEmployees,
  type DriverPerformance,
  type Employee,
} from "@/data/routeXData";

export const Route = createFileRoute("/routex/drivers")({
  head: () => ({
    meta: [{ title: "RouteX Drivers | Jump City" }],
  }),
  component: DriversPage,
});

function DriversPage() {
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [performance] = useState<DriverPerformance[]>(getDriverPerformance());
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"lead" | "helper" | "driver">("helper");

  const filtered = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [employees, search],
  );

  const selected = employees.find((e) => e.id === selectedId);
  const selectedPerf = performance.find((p) => p.employeeId === selectedId);

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const emp: Employee = {
      id: `emp-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
    };
    setEmployees((prev) => [...prev, emp]);
    setNewName("");
    setNewEmail("");
    setShowAdd(false);
    toast.success(`${emp.name} added to roster`);
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Driver & Crew Roster</h2>
          <p className="text-xs text-muted-foreground">
            {employees.length} team members · {employees.filter((e) => e.role === "lead").length}{" "}
            leads
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus className="size-4" /> Add Employee
        </Button>
      </div>

      {showAdd && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                className="text-sm"
              />
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@jumpcity.com"
                className="text-sm"
              />
              <div className="flex gap-2">
                {(["lead", "driver", "helper"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRole(r)}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-bold capitalize transition-colors",
                      newRole === r
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                <Plus className="size-3" /> Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
                <X className="size-3" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Roster list */}
        <div className="space-y-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="h-8 pl-8 text-sm"
            />
          </div>

          <Card className="shadow-sm">
            {filtered.map((emp) => {
              const perf = performance.find((p) => p.employeeId === emp.id);
              const isSelected = selectedId === emp.id;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setSelectedId(isSelected ? null : emp.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border/50 p-3 text-left last:border-0 transition-colors",
                    isSelected ? "bg-primary/5" : "hover:bg-muted/30",
                  )}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-black text-primary">
                    {emp.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{emp.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{emp.email}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      emp.role === "lead" && "bg-sky-100 text-sky-700",
                      emp.role === "driver" && "bg-amber-100 text-amber-700",
                      emp.role === "helper" && "bg-violet-100 text-violet-700",
                    )}
                  >
                    {emp.role}
                  </Badge>
                  {perf && (
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-bold text-emerald-600">{perf.onTimeRate}%</p>
                      <p className="text-[10px] text-muted-foreground">on-time</p>
                    </div>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm font-semibold text-muted-foreground">No employees found</p>
              </div>
            )}
          </Card>
        </div>

        {/* Detail panel */}
        {selected && selectedPerf ? (
          <div className="space-y-3">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-display text-base font-black text-primary">
                    {selected.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selected.name}</p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "mt-0.5 capitalize",
                        selected.role === "lead" && "bg-sky-100 text-sky-700",
                        selected.role === "driver" && "bg-amber-100 text-amber-700",
                        selected.role === "helper" && "bg-violet-100 text-violet-700",
                      )}
                    >
                      {selected.role}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>{selected.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>(763) 555-{selected.id.slice(-4).padStart(4, "0")}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <RouteIcon className="size-3.5" /> Assign
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="size-3.5" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance stats */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Performance (30 days)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Stat icon={RouteIcon} label="Routes" value={String(selectedPerf.totalRoutes)} />
                  <Stat icon={MapPin} label="Stops" value={String(selectedPerf.totalStops)} />
                  <Stat
                    icon={TrendingUp}
                    label="On-time"
                    value={`${selectedPerf.onTimeRate}%`}
                    color="text-emerald-600"
                  />
                  <Stat
                    icon={Clock}
                    label="Avg stop"
                    value={`${selectedPerf.avgStopDurationMin} min`}
                  />
                  <Stat
                    icon={Award}
                    label="Completed"
                    value={String(selectedPerf.completedRoutes)}
                  />
                  <Stat icon={RouteIcon} label="Miles" value={String(selectedPerf.totalMiles)} />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex min-h-[200px] items-center justify-center p-4 text-center">
              <div>
                <UserPlus className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-bold text-muted-foreground">
                  Select an employee to view details
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-muted-foreground" />
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <p className={cn("mt-1 font-display text-lg font-black", color)}>{value}</p>
    </div>
  );
}
