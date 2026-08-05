import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Boxes,
  Calendar,
  History,
  Mail,
  Megaphone,
  Settings as SettingsIcon,
  Tag,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAdminState } from "@/data/adminStore";
import type { ActivityEntityType } from "@/data/adminTypes";
import { EmptyState, FilterChips, TableSearch } from "@/components/admin/AdminPrimitives";

const ENTITY_ICONS: Record<ActivityEntityType, typeof Calendar> = {
  booking: Calendar,
  customer: Users,
  inventory: Boxes,
  promo: Tag,
  email: Mail,
  campaign: Megaphone,
  settings: SettingsIcon,
};

type ActivityFilter = "all" | ActivityEntityType;

/**
 * Immutable audit trail. Any question of "who changed this and when" is
 * answerable here, which matters the moment more than one person has access.
 */
export function ActivitySection() {
  const { activity } = useAdminState();
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = activity;
    if (filter !== "all") result = result.filter((a) => a.entityType === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.summary.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q),
      );
    }
    return result;
  }, [activity, filter, search]);

  const counts = useMemo(() => {
    const c = { all: activity.length } as Record<ActivityFilter, number>;
    for (const key of Object.keys(ENTITY_ICONS) as ActivityEntityType[]) {
      c[key] = activity.filter((a) => a.entityType === key).length;
    }
    return c;
  }, [activity]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          options={[
            { value: "all" as ActivityFilter, label: "All", count: counts.all },
            { value: "booking" as ActivityFilter, label: "Bookings", count: counts.booking },
            { value: "customer" as ActivityFilter, label: "Customers", count: counts.customer },
            { value: "inventory" as ActivityFilter, label: "Inventory", count: counts.inventory },
            { value: "promo" as ActivityFilter, label: "Promos", count: counts.promo },
            { value: "email" as ActivityFilter, label: "Email", count: counts.email },
            { value: "campaign" as ActivityFilter, label: "Campaigns", count: counts.campaign },
            { value: "settings" as ActivityFilter, label: "Settings", count: counts.settings },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <TableSearch value={search} onChange={setSearch} placeholder="Search activity…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity recorded"
          description="Actions you take in the admin panel will be logged here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          {filtered.map((entry, i) => {
            const Icon = ENTITY_ICONS[entry.entityType];
            return (
              <div
                key={entry.id}
                className={
                  i === filtered.length - 1
                    ? "flex items-start gap-3 p-4"
                    : "flex items-start gap-3 border-b border-border/50 p-4"
                }
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">{entry.summary}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {entry.action}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                    {entry.actor} · {formatDistanceToNow(entry.at, { addSuffix: true })} ·{" "}
                    {format(entry.at, "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs font-semibold text-muted-foreground">
        Showing {filtered.length} of {activity.length} entries · the log retains the 400 most recent
        actions.
      </p>
    </div>
  );
}
