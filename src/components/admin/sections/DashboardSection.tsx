import { useMemo } from "react";
import { format, isAfter, isBefore, startOfMonth, subDays, subMonths } from "date-fns";
import { AlertTriangle, ArrowRight, CalendarDays, DollarSign, Package, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/data/mockBookings";
import { customerMetrics, revenueBookings, useAdminState } from "@/data/adminStore";
import type { AdminSection } from "@/components/admin/AdminLayout";
import { KpiCard, StatusBadge } from "@/components/admin/AdminPrimitives";

/**
 * The "what needs my attention today" screen. Everything here is a decision
 * prompt rather than a vanity metric — each card links into the work.
 */
export function DashboardSection({
  onNavigate,
  onOpenBooking,
}: {
  onNavigate: (section: AdminSection) => void;
  onOpenBooking: (id: string) => void;
}) {
  const { bookings, customers, inventory, promos, emails } = useAdminState();

  // Pinned once per mount so the revenue memos below have a stable dependency.
  const now = useMemo(() => new Date(), []);
  const billable = useMemo(() => revenueBookings(bookings), [bookings]);

  /* Revenue this month vs last month — the single most important trend. */
  const { thisMonthRevenue, revenueTrend } = useMemo(() => {
    const thisStart = startOfMonth(now);
    const lastStart = startOfMonth(subMonths(now, 1));
    const thisMonth = billable
      .filter((b) => isAfter(b.eventDate, thisStart))
      .reduce((s, b) => s + b.total, 0);
    const lastMonth = billable
      .filter((b) => isAfter(b.eventDate, lastStart) && isBefore(b.eventDate, thisStart))
      .reduce((s, b) => s + b.total, 0);
    const trend = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    return { thisMonthRevenue: thisMonth, revenueTrend: trend };
  }, [billable, now]);

  const monthlyRevenue = useMemo(() => {
    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = startOfMonth(subMonths(now, i - 1));
      const revenue = billable
        .filter((b) => isAfter(b.eventDate, monthStart) && isBefore(b.eventDate, monthEnd))
        .reduce((s, b) => s + b.total, 0);
      months.push({ label: format(monthStart, "MMM"), revenue });
    }
    return months;
  }, [billable, now]);

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  /* Action queues */
  const openRequests = bookings.filter((b) => b.status === "open");
  const unpaidUpcoming = bookings.filter(
    (b) => b.status !== "cancelled" && b.paymentStatus === "unpaid" && isAfter(b.eventDate, now),
  );
  const upcoming7d = bookings
    .filter(
      (b) =>
        b.status !== "cancelled" &&
        isAfter(b.eventDate, now) &&
        isBefore(b.eventDate, subDays(now, -7)),
    )
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  const needsAttentionInventory = inventory.filter(
    (i) => i.status === "damaged" || i.status === "out-for-cleaning",
  );
  const atRiskCustomers = customers.filter((c) => {
    const m = customerMetrics(c.id, bookings);
    return m.bookingCount > 0 && (m.daysSinceLastBooking ?? 0) >= 90;
  });

  const topItems = useMemo(() => {
    const counts = new Map<string, { name: string; count: number; revenue: number }>();
    for (const b of billable) {
      const existing = counts.get(b.item.slug);
      if (existing) {
        existing.count += 1;
        existing.revenue += b.total;
      } else {
        counts.set(b.item.slug, { name: b.item.name, count: 1, revenue: b.total });
      }
    }
    return [...counts.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [billable]);

  const avgOrderValue =
    billable.length > 0 ? billable.reduce((s, b) => s + b.total, 0) / billable.length : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue this month"
          value={formatMoney(thisMonthRevenue)}
          icon={DollarSign}
          trend={revenueTrend}
          trendLabel="vs last month"
        />
        <KpiCard label="Avg order value" value={formatMoney(avgOrderValue)} icon={CalendarDays} />
        <KpiCard label="Active customers" value={String(customers.length)} icon={Users} />
        <KpiCard
          label="Units needing service"
          value={String(needsAttentionInventory.length)}
          icon={Package}
        />
      </div>

      {/* Action queue — the reason to open this page each morning */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ActionCard
          title="Unconfirmed requests"
          count={openRequests.length}
          description="New booking requests waiting on a quote or confirmation."
          actionLabel="Review bookings"
          onAction={() => onNavigate("bookings")}
          tone={openRequests.length > 0 ? "warn" : "ok"}
        />
        <ActionCard
          title="Unpaid upcoming events"
          count={unpaidUpcoming.length}
          description="Events happening soon with no deposit collected yet."
          actionLabel="Chase payments"
          onAction={() => onNavigate("bookings")}
          tone={unpaidUpcoming.length > 0 ? "danger" : "ok"}
        />
        <ActionCard
          title="Customers going quiet"
          count={atRiskCustomers.length}
          description="No booking in 90+ days. Prime win-back campaign targets."
          actionLabel="Send win-back"
          onAction={() => onNavigate("marketing")}
          tone={atRiskCustomers.length > 0 ? "warn" : "ok"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue trend */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue — last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-44 items-end justify-between gap-2">
              {monthlyRevenue.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {m.revenue > 0 ? formatMoney(m.revenue).replace(/\.\d+$/, "") : ""}
                  </span>
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all"
                    style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 2)}%` }}
                  />
                  <span className="text-xs font-bold text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next 7 days */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Next 7 days ({upcoming7d.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming7d.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-muted-foreground">
                Nothing scheduled in the next week.
              </p>
            ) : (
              upcoming7d.slice(0, 6).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onOpenBooking(b.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-2.5 text-left transition-colors hover:bg-muted/40"
                >
                  <img
                    src={b.item.image}
                    alt={b.item.alt}
                    className="size-9 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{b.item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(b.eventDate, "EEE MMM d")} · {b.address.city}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top earners */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top earning items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-black text-primary">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.name}</span>
                <span className="text-xs font-semibold text-muted-foreground">{item.count}×</span>
                <span className="w-20 text-right text-sm font-bold">
                  {formatMoney(item.revenue)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ops snapshot */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Operations snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <SnapshotRow
              label="Inventory available"
              value={`${inventory.filter((i) => i.status === "available").length} of ${inventory.length}`}
            />
            <SnapshotRow
              label="Damaged / cleaning"
              value={String(needsAttentionInventory.length)}
              warn={needsAttentionInventory.length > 0}
            />
            <SnapshotRow
              label="Active promo codes"
              value={String(promos.filter((p) => p.active).length)}
            />
            <SnapshotRow
              label="Newsletter subscribers"
              value={String(customers.filter((c) => c.newsletterOptIn).length)}
            />
            <SnapshotRow label="Emails sent" value={String(emails.length)} />
            <SnapshotRow
              label="Cancellation rate"
              value={`${bookings.length > 0 ? Math.round(((bookings.length - billable.length) / bookings.length) * 100) : 0}%`}
              warn={
                bookings.length > 0 && (bookings.length - billable.length) / bookings.length > 0.1
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Local helpers ──────────────────────────────────────────────────── */

function ActionCard({
  title,
  count,
  description,
  actionLabel,
  onAction,
  tone,
}: {
  title: string;
  count: number;
  description: string;
  actionLabel: string;
  onAction: () => void;
  tone: "ok" | "warn" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-300 dark:border-rose-900"
      : tone === "warn"
        ? "border-amber-300 dark:border-amber-900"
        : "border-border";

  return (
    <Card className={`shadow-sm ${toneClass}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 font-display text-3xl font-black">{count}</p>
          </div>
          {count > 0 && tone !== "ok" && (
            <AlertTriangle
              className={tone === "danger" ? "size-5 text-rose-500" : "size-5 text-amber-500"}
            />
          )}
          {count === 0 && <Badge variant="secondary">All clear</Badge>}
        </div>
        <p className="mt-2 text-xs font-semibold text-muted-foreground">{description}</p>
        {count > 0 && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onAction}>
            {actionLabel} <ArrowRight className="size-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SnapshotRow({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <span className={warn ? "font-bold text-amber-600" : "font-bold"}>{value}</span>
    </div>
  );
}
