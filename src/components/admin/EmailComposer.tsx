import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Eye, Loader2, Send, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { emailActions, useAdminState } from "@/data/adminStore";
import type { AdminBooking, AdminCustomer } from "@/data/adminTypes";
import {
  emailTemplates,
  findUnresolvedTags,
  MERGE_TAGS,
  renderTemplate,
} from "@/data/emailTemplates";

/**
 * Single composer used for both 1:1 customer emails and bulk sends. Preview is
 * always rendered against a real recipient so merge tags are verified before
 * anything leaves the building.
 */
export function EmailComposer({
  open,
  onOpenChange,
  recipients,
  booking,
  defaultTemplateId,
  kind = "transactional",
  campaignId,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: AdminCustomer[];
  booking?: AdminBooking | null;
  defaultTemplateId?: string;
  kind?: "transactional" | "campaign";
  campaignId?: string | null;
  onSent?: (count: number) => void;
}) {
  const { settings } = useAdminState();
  const [templateId, setTemplateId] = useState(defaultTemplateId ?? "tpl-blank");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const previewRecipient = recipients[previewIndex] ?? recipients[0] ?? null;

  // Load the selected template whenever the dialog opens or the pick changes.
  useEffect(() => {
    if (!open) return;
    const tpl = emailTemplates.find((t) => t.id === templateId);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  }, [templateId, open]);

  useEffect(() => {
    if (open) {
      setTemplateId(defaultTemplateId ?? "tpl-blank");
      setPreviewIndex(0);
    }
  }, [open, defaultTemplateId]);

  const ctx = useMemo(
    () =>
      previewRecipient ? { customer: previewRecipient, settings, booking: booking ?? null } : null,
    [previewRecipient, settings, booking],
  );

  const renderedSubject = ctx ? renderTemplate(subject, ctx) : subject;
  const renderedBody = ctx ? renderTemplate(body, ctx) : body;

  const unresolved = useMemo(() => {
    if (!ctx) return [];
    return [...new Set([...findUnresolvedTags(subject, ctx), ...findUnresolvedTags(body, ctx)])];
  }, [subject, body, ctx]);

  const insertTag = (tag: string) => {
    setBody((prev) => `${prev}${tag}`);
  };

  const handleSend = () => {
    if (!subject.trim()) {
      toast.error("Add a subject line before sending.");
      return;
    }
    if (!body.trim()) {
      toast.error("The message body is empty.");
      return;
    }
    if (recipients.length === 0) {
      toast.error("No recipients selected.");
      return;
    }

    setSending(true);
    // Simulated delivery — mirrors the latency of a real ESP round trip.
    setTimeout(() => {
      emailActions.send({
        kind,
        campaignId: campaignId ?? null,
        subject,
        body,
        recipients: recipients.map((c) => ({
          customerId: c.id,
          name: c.name,
          email: c.email,
        })),
      });
      setSending(false);
      onOpenChange(false);
      onSent?.(recipients.length);
      toast.success(
        recipients.length === 1
          ? `Email sent to ${recipients[0]!.email}`
          : `Email sent to ${recipients.length} recipients`,
      );
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4 text-primary" />
            Compose email
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {recipients.length === 1 && recipients[0]
              ? `To ${recipients[0].name} · ${recipients[0].email}`
              : `Sending to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold">Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates
                  .filter((t) => !t.requiresBooking || booking)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-1 size-3.5" /> Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 pt-3">
              <div>
                <Label className="text-xs font-bold">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your rental is confirmed!"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Message</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="mt-1 font-mono text-xs"
                  placeholder="Write your message…"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Insert merge tag</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {MERGE_TAGS.filter(
                    (t) => booking || !t.description.includes("booking emails"),
                  ).map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      title={t.description}
                      onClick={() => insertTag(t.tag)}
                      className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {t.tag}
                    </button>
                  ))}
                </div>
              </div>

              {unresolved.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    These tags can&apos;t be resolved and will be removed on send:{" "}
                    <span className="font-mono">{unresolved.join(", ")}</span>
                  </span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-3 pt-3">
              {recipients.length > 1 && previewRecipient && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-bold">Preview as</Label>
                  <Select
                    value={String(previewIndex)}
                    onValueChange={(v) => setPreviewIndex(Number(v))}
                  >
                    <SelectTrigger className="h-8 w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.slice(0, 50).map((c, i) => (
                        <SelectItem key={c.id} value={String(i)}>
                          {c.name} — {c.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card">
                <div className="space-y-1 border-b border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground">
                    From: {settings.emailSenderName} &lt;{settings.contactEmail}&gt;
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    To: {previewRecipient?.email ?? "—"}
                  </p>
                  <p className="pt-1 text-sm font-extrabold">
                    {renderedSubject || <span className="text-muted-foreground">(no subject)</span>}
                  </p>
                </div>
                <div className="whitespace-pre-wrap p-4 text-sm leading-relaxed">
                  {renderedBody || <span className="text-muted-foreground">(empty message)</span>}
                </div>
              </div>

              <p className="text-xs font-semibold text-muted-foreground">
                This is a demo panel — messages are recorded in the outbox but not delivered to real
                inboxes.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <div className="mr-auto flex items-center gap-2">
            <Badge variant="secondary">{recipients.length} recipient(s)</Badge>
            {kind === "campaign" && <Badge>Campaign</Badge>}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send className="size-4" /> Send
                {recipients.length > 1 ? ` to ${recipients.length}` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
