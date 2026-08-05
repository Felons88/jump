import { useMemo, useState } from "react";
import { format, isAfter, isBefore, startOfMonth, subMonths } from "date-fns";
import { BarChart3, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/data/mockBookings";
import { customerMetrics, revenueBookings, useAdminState } from "@/data/adminStore";
import { askFollowUp, generateInsights, hasOpenRouterKey } from "@/lib/openrouter";

export function InsightsSection() {
  const state = useAdminState();
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const billable = revenueBookings(state.bookings);

  const monthlyRevenue = useMemo(() => {
    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1));
      const revenue = billable
        .filter((b) => isAfter(b.eventDate, monthStart) && isBefore(b.eventDate, monthEnd))
        .reduce((s, b) => s + b.total, 0);
      months.push({ label: format(monthStart, "MMM"), revenue });
    }
    return months;
  }, [billable]);

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const businessData = useMemo(
    () => buildBusinessData(state, monthlyRevenue),
    [state, monthlyRevenue],
  );

  const handleGenerate = async () => {
    setLoading(true);
    setInsights(null);
    const result = await generateInsights(businessData);
    setInsights(result);
    setLoading(false);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    const result = await askFollowUp(businessData, question.trim());
    setAnswer(result);
    setAsking(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-5 text-primary" /> AI Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasOpenRouterKey && (
            <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3 text-sm font-semibold text-secondary">
              Add a VITE_OPENROUTER_API_KEY environment variable to enable real AI insights. Without
              it, a placeholder message will be shown.
            </div>
          )}

          {!insights && !loading && (
            <Button onClick={handleGenerate} size="lg">
              <Sparkles className="size-4" /> Generate insights
            </Button>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> Analyzing business data…
            </div>
          )}

          {insights && (
            <>
              <div className="whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed">
                {insights}
              </div>
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                Regenerate
              </Button>
            </>
          )}

          {insights && (
            <div className="space-y-2 border-t border-border pt-4">
              <Label className="text-sm font-bold">Ask a follow-up question</Label>
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What should I focus on marketing this month?"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAsk();
                  }}
                />
                <Button onClick={handleAsk} disabled={asking || !question.trim()}>
                  {asking ? <Loader2 className="size-4 animate-spin" /> : "Ask"}
                </Button>
              </div>
              {answer && (
                <div className="whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed">
                  {answer}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-5 text-primary" /> Revenue (last 6 months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end justify-between gap-2">
            {monthlyRevenue.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Data sent to the model</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            {businessData}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Prompt context builder ─────────────────────────────────────────── */

function buildBusinessData(
  state: ReturnType<typeof useAdminState>,
  monthlyRev: { label: string; revenue: number }[],
): string {
  const { bookings, customers, inventory, promos, emails, campaigns } = state;
  const billable = revenueBookings(bookings);
  const totalRevenue = billable.reduce((s, b) => s + b.total, 0);
  const avgOrder = billable.length > 0 ? totalRevenue / billable.length : 0;

  const itemStats = new Map<string, { name: string; count: number; revenue: number }>();
  for (const b of billable) {
    const existing = itemStats.get(b.item.slug);
    if (existing) {
      existing.count += 1;
      existing.revenue += b.total;
    } else {
      itemStats.set(b.item.slug, { name: b.item.name, count: 1, revenue: b.total });
    }
  }
  const topItems = [...itemStats.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const atRisk = customers.filter((c) => {
    const m = customerMetrics(c.id, bookings);
    return m.bookingCount > 0 && (m.daysSinceLastBooking ?? 0) >= 90;
  }).length;

  const repeatCustomers = customers.filter(
    (c) => customerMetrics(c.id, bookings).bookingCount >= 2,
  ).length;

  return [
    "BUSINESS SUMMARY",
    `Total bookings: ${bookings.length} (${billable.length} billable, ${bookings.length - billable.length} cancelled)`,
    `Total revenue: ${formatMoney(totalRevenue)}`,
    `Average order value: ${formatMoney(avgOrder)}`,
    `Open requests: ${bookings.filter((b) => b.status === "open").length}`,
    `Confirmed: ${bookings.filter((b) => b.status === "confirmed").length}`,
    `Completed: ${bookings.filter((b) => b.status === "completed").length}`,
    `Unpaid bookings: ${bookings.filter((b) => b.paymentStatus === "unpaid" && b.status !== "cancelled").length}`,
    "",
    "MONTHLY REVENUE (last 6 months):",
    ...monthlyRev.map((m) => `  ${m.label}: ${formatMoney(m.revenue)}`),
    "",
    "TOP 5 ITEMS BY REVENUE:",
    ...topItems.map(
      (p, i) => `  ${i + 1}. ${p.name} — ${p.count} bookings, ${formatMoney(p.revenue)}`,
    ),
    "",
    "INVENTORY:",
    `  Total units: ${inventory.length}`,
    `  Available: ${inventory.filter((i) => i.status === "available").length}`,
    `  Damaged: ${inventory.filter((i) => i.status === "damaged").length}`,
    `  Out for cleaning: ${inventory.filter((i) => i.status === "out-for-cleaning").length}`,
    `  Retired: ${inventory.filter((i) => i.status === "retired").length}`,
    `  Asset value: ${formatMoney(inventory.reduce((s, i) => s + i.purchasePrice, 0))}`,
    "",
    "CUSTOMERS:",
    `  Total: ${customers.length}`,
    `  Repeat customers: ${repeatCustomers}`,
    `  At risk (90+ days quiet): ${atRisk}`,
    `  Newsletter subscribers: ${customers.filter((c) => c.newsletterOptIn).length}`,
    `  VIP tagged: ${customers.filter((c) => c.tags.includes("vip")).length}`,
    "",
    "MARKETING:",
    `  Emails sent: ${emails.length} (${emails.reduce((s, e) => s + e.recipients.length, 0)} deliveries)`,
    `  Campaigns: ${campaigns.length} (${campaigns.filter((c) => c.status === "sent").length} sent)`,
    "",
    "PROMO CODES:",
    `  Active: ${promos.filter((p) => p.active).length}`,
    `  Inactive: ${promos.filter((p) => !p.active).length}`,
    `  Total redemptions: ${promos.reduce((s, p) => s + p.usageCount, 0)}`,
  ].join("\n");
}
