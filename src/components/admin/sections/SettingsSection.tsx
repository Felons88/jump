import { useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminStore, settingsActions, useAdminState } from "@/data/adminStore";
import type { AdminSettings } from "@/data/adminTypes";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

/**
 * Settings are the source of truth for pricing math used by the booking editor
 * and checkout, so changes here ripple through every future calculation.
 */
export function SettingsSection() {
  const { settings } = useAdminState();
  const [draft, setDraft] = useState<AdminSettings>(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const set = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const handleSave = () => {
    if (!draft.businessName.trim()) {
      toast.error("Business name can't be empty.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(draft.contactEmail)) {
      toast.error("Enter a valid contact email.");
      return;
    }
    if (draft.taxRate < 0 || draft.taxRate > 25) {
      toast.error("Tax rate should be between 0 and 25%.");
      return;
    }
    if (draft.depositPercent < 0 || draft.depositPercent > 100) {
      toast.error("Deposit percent must be between 0 and 100.");
      return;
    }
    settingsActions.update(draft);
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Business details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Business name">
              <Input
                value={draft.businessName}
                onChange={(e) => set("businessName", e.target.value)}
              />
            </Field>
            <Field label="Contact email">
              <Input
                value={draft.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact phone">
              <Input
                value={draft.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
              />
            </Field>
            <Field label="Address">
              <Input
                value={draft.addressLine}
                onChange={(e) => set("addressLine", e.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Pricing &amp; delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Tax rate (%)">
              <Input
                type="number"
                step="0.001"
                value={draft.taxRate}
                onChange={(e) => set("taxRate", Number(e.target.value))}
              />
            </Field>
            <Field label="Deposit (%)">
              <Input
                type="number"
                value={draft.depositPercent}
                onChange={(e) => set("depositPercent", Number(e.target.value))}
              />
            </Field>
            <Field label="Free delivery over ($)">
              <Input
                type="number"
                value={draft.freeDeliveryThreshold}
                onChange={(e) => set("freeDeliveryThreshold", Number(e.target.value))}
              />
            </Field>
            <Field label="Standard delivery fee ($)">
              <Input
                type="number"
                value={draft.standardDeliveryFee}
                onChange={(e) => set("standardDeliveryFee", Number(e.target.value))}
              />
            </Field>
          </div>
          <p className="text-xs font-semibold text-muted-foreground">
            These values drive the totals recalculated in the booking editor.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Email defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Sender name">
            <Input
              value={draft.emailSenderName}
              onChange={(e) => set("emailSenderName", e.target.value)}
            />
          </Field>
          <Field label="Signature">
            <Textarea
              rows={3}
              value={draft.emailSignature}
              onChange={(e) => set("emailSignature", e.target.value)}
            />
          </Field>
          <p className="text-xs font-semibold text-muted-foreground">
            The signature resolves the <span className="font-mono">{"{{signature}}"}</span> merge
            tag in every template.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Notifications &amp; automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <ToggleRow
            label="Notify on new booking"
            description="Alert the team when a request comes in"
            checked={draft.notifyOnNewBooking}
            onChange={(v) => set("notifyOnNewBooking", v)}
          />
          <ToggleRow
            label="Notify on cancellation"
            description="Alert the team when a booking is cancelled"
            checked={draft.notifyOnCancellation}
            onChange={(v) => set("notifyOnCancellation", v)}
          />
          <ToggleRow
            label="Auto-send invoice on confirmation"
            description="Email the invoice the moment a booking is confirmed"
            checked={draft.autoSendInvoice}
            onChange={(v) => set("autoSendInvoice", v)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleSave} disabled={!dirty}>
          <Save className="size-4" /> {dirty ? "Save changes" : "Saved"}
        </Button>
        {dirty && (
          <Button variant="ghost" onClick={() => setDraft(settings)}>
            Discard changes
          </Button>
        )}
        <Button
          variant="outline"
          className="ml-auto text-destructive hover:text-destructive"
          onClick={() => setConfirmReset(true)}
        >
          <RotateCcw className="size-4" /> Reset demo data
        </Button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset all demo data?"
        description="This wipes every customer, booking, inventory record, promo, email and campaign, then re-seeds the workspace from scratch. Useful for demos, destructive otherwise."
        confirmLabel="Reset everything"
        destructive
        onConfirm={() => {
          adminStore.reset();
          setConfirmReset(false);
          toast.success("Workspace reset to seed data");
        }}
      />
    </div>
  );
}

/* ── Local helpers ──────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-bold">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
