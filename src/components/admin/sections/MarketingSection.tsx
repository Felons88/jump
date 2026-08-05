import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Inbox, Mail, MousePointerClick, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  campaignActions,
  emailActions,
  resolveSegment,
  SEGMENT_LABELS,
  useAdminState,
} from "@/data/adminStore";
import type { Campaign, SegmentKey } from "@/data/adminTypes";
import { emailTemplates } from "@/data/emailTemplates";
import { EmptyState, KpiCard } from "@/components/admin/AdminPrimitives";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmailComposer } from "@/components/admin/EmailComposer";

const SEGMENT_KEYS: SegmentKey[] = [
  "all",
  "newsletter",
  "vip",
  "repeat",
  "at-risk",
  "no-bookings",
  "recent-30d",
];

/**
 * Mass-marketing surface. Segments are computed live off booking behaviour, so
 * a "win-back" list is always current rather than a stale exported CSV.
 */
export function MarketingSection() {
  const { customers, bookings, campaigns, emails } = useAdminState();

  const [segment, setSegment] = useState<SegmentKey>("newsletter");
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("tpl-seasonal");
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);

  const recipients = useMemo(
    () => resolveSegment(segment, customers, bookings),
    [segment, customers, bookings],
  );

  const segmentSizes = useMemo(() => {
    const sizes = {} as Record<SegmentKey, number>;
    for (const key of SEGMENT_KEYS) {
      sizes[key] = resolveSegment(key, customers, bookings).length;
    }
    return sizes;
  }, [customers, bookings]);

  const campaignEmails = emails.filter((e) => e.kind === "campaign");
  const totalSent = emails.reduce((s, e) => s + e.recipients.length, 0);
  const totalOpens = emails.reduce((s, e) => s + e.openedCount, 0);
  const totalClicks = emails.reduce((s, e) => s + e.clickedCount, 0);
  const openRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicks / totalSent) * 100) : 0;

  const handleLaunch = () => {
    if (recipients.length === 0) {
      toast.error("That segment has no customers in it.");
      return;
    }
    const campaignName =
      name.trim() || `${SEGMENT_LABELS[segment]} — ${format(new Date(), "MMM d")}`;
    const template = emailTemplates.find((t) => t.id === templateId);

    const campaign = campaignActions.saveDraft({
      name: campaignName,
      subject: template?.subject ?? "",
      body: template?.body ?? "",
      segment,
      recipientCount: recipients.length,
    });
    setActiveCampaign(campaign);
    setComposerOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Emails delivered" value={String(totalSent)} icon={Mail} />
        <KpiCard label="Open rate" value={`${openRate}%`} icon={Inbox} />
        <KpiCard label="Click rate" value={`${clickRate}%`} icon={MousePointerClick} />
        <KpiCard
          label="Campaigns run"
          value={String(campaigns.filter((c) => c.status === "sent").length)}
          icon={Send}
        />
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">New campaign</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="outbox">Outbox ({emails.length})</TabsTrigger>
        </TabsList>

        {/* ── Compose ── */}
        <TabsContent value="compose" className="pt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Launch a campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-bold">Campaign name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Summer early-bird push"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">Starting template</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates
                        .filter((t) => !t.requiresBooking)
                        .map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold">Audience segment</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {SEGMENT_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSegment(key)}
                      className={
                        segment === key
                          ? "rounded-lg border-2 border-primary bg-primary/5 p-3 text-left"
                          : "rounded-lg border-2 border-border p-3 text-left transition-colors hover:bg-muted/50"
                      }
                    >
                      <p className="text-sm font-bold">{SEGMENT_LABELS[key]}</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {segmentSizes[key]} customer{segmentSizes[key] === 1 ? "" : "s"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <span className="text-sm font-bold">
                    {recipients.length} recipient{recipients.length === 1 ? "" : "s"} selected
                  </span>
                </div>
                <Button onClick={handleLaunch} disabled={recipients.length === 0}>
                  <Send className="size-4" /> Compose &amp; send
                </Button>
              </div>

              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {recipients.slice(0, 12).map((c) => (
                    <Badge key={c.id} variant="secondary" className="text-[10px]">
                      {c.name}
                    </Badge>
                  ))}
                  {recipients.length > 12 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{recipients.length - 12} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Segments ── */}
        <TabsContent value="segments" className="space-y-3 pt-4">
          {SEGMENT_KEYS.map((key) => {
            const list = resolveSegment(key, customers, bookings);
            return (
              <Card key={key} className="shadow-sm">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-extrabold">{SEGMENT_LABELS[key]}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {list.length} customer{list.length === 1 ? "" : "s"}
                      {list.length > 0 &&
                        ` · e.g. ${list
                          .slice(0, 3)
                          .map((c) => c.name)
                          .join(", ")}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={list.length === 0}
                    onClick={() => {
                      setSegment(key);
                      setActiveCampaign(null);
                      setComposerOpen(true);
                    }}
                  >
                    <Mail className="size-3.5" /> Email this segment
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ── Campaigns ── */}
        <TabsContent value="campaigns" className="space-y-3 pt-4">
          {campaigns.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No campaigns yet"
              description="Launch your first campaign from the New campaign tab."
            />
          ) : (
            campaigns.map((c) => (
              <Card key={c.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold">{c.name}</p>
                        <Badge variant={c.status === "sent" ? "default" : "secondary"}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                        {SEGMENT_LABELS[c.segment]} · {c.recipientCount} recipients
                        {c.sentAt && ` · sent ${format(c.sentAt, "MMM d, yyyy h:mm a")}`}
                      </p>
                      {c.subject && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          Subject: {c.subject}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status === "sent" && (
                        <div className="text-right text-xs font-semibold text-muted-foreground">
                          <p>{c.openedCount} opens</p>
                          <p>{c.clickedCount} clicks</p>
                        </div>
                      )}
                      {c.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSegment(c.segment);
                            setActiveCampaign(c);
                            setComposerOpen(true);
                          }}
                        >
                          <Send className="size-3.5" /> Send
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(c)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── Outbox ── */}
        <TabsContent value="outbox" className="space-y-3 pt-4">
          {emails.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Outbox is empty"
              description="Emails you send from anywhere in the panel are recorded here."
            />
          ) : (
            emails.map((e) => (
              <Card key={e.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold">{e.subject}</p>
                        <Badge variant="secondary" className="capitalize">
                          {e.kind}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.body}</p>
                      <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
                        {format(e.sentAt, "MMM d, yyyy h:mm a")} · {e.recipients.length}{" "}
                        recipient(s)
                        {" · "}
                        {e.recipients
                          .slice(0, 3)
                          .map((r) => r.email)
                          .join(", ")}
                        {e.recipients.length > 3 && ` +${e.recipients.length - 3} more`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs font-semibold text-muted-foreground">
                        <p>{e.openedCount} opens</p>
                        <p>{e.clickedCount} clicks</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          emailActions.remove(e.id);
                          toast.success("Removed from outbox");
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {campaignEmails.length > 0 && (
            <p className="text-center text-xs font-semibold text-muted-foreground">
              {campaignEmails.length} of {emails.length} were campaign sends.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <EmailComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        recipients={recipients}
        kind="campaign"
        campaignId={activeCampaign?.id ?? null}
        defaultTemplateId={templateId}
        onSent={(count) => {
          if (activeCampaign) {
            // Roll the simulated engagement from the send into campaign stats.
            const opens = Math.round(count * 0.42);
            const clicks = Math.round(count * 0.11);
            campaignActions.markSent(activeCampaign.id, count, opens, clicks);
          }
          setActiveCampaign(null);
          setName("");
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete campaign "${deleteTarget?.name ?? ""}"?`}
        description="This removes the campaign record and its performance stats. Sent emails remain in the outbox."
        confirmLabel="Delete campaign"
        destructive
        onConfirm={() => {
          if (deleteTarget) {
            campaignActions.remove(deleteTarget.id);
            toast.success("Campaign deleted");
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
