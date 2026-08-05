import { Check, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import type { CadenceStatus } from "@/data/routeXData";

export function CadenceTimeline({ stages }: { stages: CadenceStatus[] }) {
  const completed = stages.filter((s) => s.completedAt !== null).length;
  const nextPending = stages.find((s) => s.completedAt === null);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Daily Cadence
        </p>
        {nextPending ? (
          <span className="text-xs font-bold text-primary">{nextPending.description}</span>
        ) : (
          <span className="text-xs font-bold text-emerald-600">All stages complete</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {stages.map((stage, i) => {
          const isDone = stage.completedAt !== null;
          const isLast = i === stages.length - 1;
          return (
            <div key={stage.stage} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 transition-colors",
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3.5" /> : <Clock className="size-3" />}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    isDone ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {stage.label}
                </span>
                {isDone && stage.completedAt && (
                  <span className="text-[9px] text-muted-foreground">
                    {format(stage.completedAt, "h:mm a")}
                  </span>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full",
                    isDone && stages[i + 1]?.completedAt !== null ? "bg-emerald-500" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-2">
        <Loader2 className="size-3 animate-spin text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">
          {completed}/{stages.length} stages complete
          {nextPending && ` · Next: ${nextPending.label}`}
        </span>
      </div>
    </div>
  );
}
