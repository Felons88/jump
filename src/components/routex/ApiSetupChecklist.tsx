import { CheckCircle2, Circle, Key, Mail, Map } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasMapboxToken } from "@/lib/routeOptimizer";
import { hasBrevoKey } from "@/lib/brevo";

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  icon: typeof Key;
  done: boolean;
  actionLabel: string;
  actionHref: string;
};

export function ApiSetupChecklist() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const items: ChecklistItem[] = [
    {
      id: "mapbox",
      label: "Mapbox token",
      description:
        "Enables live map rendering and route optimization via Mapbox GL JS + Optimization API.",
      icon: Map,
      done: hasMapboxToken,
      actionLabel: "Get token",
      actionHref: "https://account.mapbox.com/access-tokens/",
    },
    {
      id: "brevo",
      label: "Brevo API key",
      description:
        "Enables dispatch email notifications to drivers and delivery alerts to customers.",
      icon: Mail,
      done: hasBrevoKey,
      actionLabel: "Get key",
      actionHref: "https://app.brevo.com/settings/keys/api",
    },
  ];

  const allDone = items.every((i) => i.done);
  if (allDone) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="size-4 text-primary" />
          <p className="text-sm font-bold">Setup checklist</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3",
                item.done ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-muted/30",
              )}
            >
              {item.done ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-muted-foreground" />
                  <p className="text-sm font-bold">{item.label}</p>
                  {item.done && (
                    <span className="text-[10px] font-bold text-emerald-600">Configured</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                {!item.done && (
                  <a
                    href={item.actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    {item.actionLabel} →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        RouteX works in demo mode without these keys — add them to enable live maps and real email
        dispatch.
      </p>
    </div>
  );
}
