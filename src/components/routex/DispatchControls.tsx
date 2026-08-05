import { Check, CheckCheck, Eye, Loader2, Mail, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getEmployees,
  type RouteXRoute,
  type StaffAssignment,
  type StaffSendStatus,
} from "@/data/routeXData";

const SEND_STATUS_CONFIG: Record<
  StaffSendStatus,
  { label: string; icon: typeof Send; className: string }
> = {
  "not-sent": { label: "Not sent", icon: Mail, className: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", icon: Check, className: "bg-sky-100 text-sky-700" },
  opened: { label: "Opened", icon: Eye, className: "bg-amber-100 text-amber-700" },
  "in-progress": {
    label: "In progress",
    icon: Loader2,
    className: "bg-violet-100 text-violet-700",
  },
  completed: { label: "Completed", icon: CheckCheck, className: "bg-emerald-100 text-emerald-700" },
};

export function DispatchControls({
  route,
  onDispatch,
  onReoptimize,
}: {
  route: RouteXRoute;
  onDispatch: (routeId: string) => void;
  onReoptimize: (routeId: string) => void;
}) {
  const employees = getEmployees();

  const handleDispatch = () => {
    onDispatch(route.id);
    toast.success(`Route dispatched to ${route.assignments.length} staff member(s)`);
  };

  const handleReoptimize = () => {
    onReoptimize(route.id);
    toast.success("Route re-optimized");
  };

  const isDispatched = route.status === "dispatched" || route.status === "in-progress";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Dispatch</p>
        <Badge
          variant="secondary"
          className={cn(
            isDispatched ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
          )}
        >
          {isDispatched ? "Dispatched" : "Not dispatched"}
        </Badge>
      </div>

      {/* Staff assignments with send status */}
      <div className="space-y-2">
        {route.assignments.map((assignment) => {
          const emp = employees.find((e) => e.id === assignment.employeeId);
          if (!emp) return null;
          const statusConfig = SEND_STATUS_CONFIG[assignment.sendStatus];
          const StatusIcon = statusConfig.icon;
          return (
            <div
              key={assignment.employeeId}
              className="flex items-center gap-3 rounded-lg border border-border/50 p-2"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 font-display text-[10px] font-black text-primary">
                {emp.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {emp.name}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({assignment.role})
                  </span>
                </p>
                {assignment.sentAt && (
                  <p className="text-[10px] text-muted-foreground">
                    Sent {format(assignment.sentAt, "h:mm a")}
                    {assignment.openedAt && ` · Opened ${format(assignment.openedAt, "h:mm a")}`}
                  </p>
                )}
              </div>
              <Badge
                variant="secondary"
                className={cn("shrink-0 text-[10px]", statusConfig.className)}
              >
                <StatusIcon
                  className={cn(
                    "size-3",
                    assignment.sendStatus === "in-progress" && "animate-spin",
                  )}
                />
                {statusConfig.label}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        {!isDispatched ? (
          <Button className="flex-1" onClick={handleDispatch} disabled={route.status === "draft"}>
            <Send className="size-4" /> Dispatch route
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" onClick={handleDispatch}>
            <Mail className="size-4" /> Re-send
          </Button>
        )}
        <Button variant="outline" onClick={handleReoptimize}>
          Re-optimize
        </Button>
      </div>
      {route.status === "draft" && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Optimize the route before dispatching
        </p>
      )}
    </div>
  );
}
