import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminStore, promoActions } from "@/data/adminStore";
import type { AdminPromoCode } from "@/data/adminTypes";

/** Create/edit dialog for promo codes. `promo: null` means create mode. */
export function PromoEditDialog({
  promo,
  open,
  onOpenChange,
}: {
  promo: AdminPromoCode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isCreate = promo === null;

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("0");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (promo) {
      setCode(promo.code);
      setDescription(promo.description);
      setType(promo.type);
      setValue(String(promo.value));
      setMinOrder(String(promo.minOrder));
      setExpiresAt(promo.expiresAt ? format(promo.expiresAt, "yyyy-MM-dd") : "");
      setUsageLimit(promo.usageLimit === null ? "" : String(promo.usageLimit));
      setActive(promo.active);
    } else {
      setCode("");
      setDescription("");
      setType("percent");
      setValue("10");
      setMinOrder("0");
      setExpiresAt("");
      setUsageLimit("");
      setActive(true);
    }
  }, [promo, open]);

  const handleSave = () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      toast.error("Promo code is required.");
      return;
    }
    if (!/^[A-Z0-9]+$/.test(normalized)) {
      toast.error("Use letters and numbers only — no spaces or symbols.");
      return;
    }

    const nValue = Number(value);
    if (!Number.isFinite(nValue) || nValue <= 0) {
      toast.error("Enter a discount value greater than zero.");
      return;
    }
    if (type === "percent" && nValue > 100) {
      toast.error("A percentage discount can't exceed 100%.");
      return;
    }

    // Uniqueness check against the live store, ignoring the record being edited.
    const clash = adminStore
      .getState()
      .promos.find((p) => p.code === normalized && p.id !== promo?.id);
    if (clash) {
      toast.error(`${normalized} already exists.`);
      return;
    }

    const payload = {
      code: normalized,
      description: description.trim() || "Promotional discount",
      type,
      value: nValue,
      minOrder: Number(minOrder) || 0,
      expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`) : null,
      usageLimit: usageLimit.trim() === "" ? null : Number(usageLimit),
      active,
    };

    if (isCreate) {
      promoActions.create(payload);
      toast.success(`${normalized} created`);
    } else {
      promoActions.update(promo.id, payload);
      toast.success(`${normalized} updated`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create promo code" : `Edit ${promo.code}`}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Discounts apply to the order subtotal before tax and delivery."
              : `Redeemed ${promo.usageCount} time(s) since ${format(promo.createdAt, "MMM yyyy")}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold">Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER25"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Discount type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "percent" | "flat")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage off</SelectItem>
                  <SelectItem value="flat">Flat amount off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="25% off summer bookings"
              className="mt-1"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs font-bold">
                Value {type === "percent" ? "(%)" : "($)"}
              </Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Min order ($)</Label>
              <Input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Usage limit</Label>
              <Input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="∞"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold">Expires on</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1"
            />
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              Leave blank for no expiry.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-bold">Active</p>
              <p className="text-xs text-muted-foreground">
                Inactive codes are rejected at checkout
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isCreate ? "Create code" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
