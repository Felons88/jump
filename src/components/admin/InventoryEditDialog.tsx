import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Wrench } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/data/mockBookings";
import { categories } from "@/data/site";
import { inventoryActions } from "@/data/adminStore";
import type { AdminInventoryItem, InventoryStatus, MaintenanceEntry } from "@/data/adminTypes";

const STATUSES: InventoryStatus[] = [
  "available",
  "reserved",
  "damaged",
  "out-for-cleaning",
  "retired",
];

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80";

/**
 * Handles both creating a new inventory unit and editing an existing one.
 * Passing `item: null` puts the dialog into create mode.
 */
export function InventoryEditDialog({
  item,
  open,
  onOpenChange,
}: {
  item: AdminInventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isCreate = item === null;

  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [priceFrom, setPriceFrom] = useState("199");
  const [status, setStatus] = useState<InventoryStatus>("available");
  const [purchasePrice, setPurchasePrice] = useState("1800");
  const [condition, setCondition] = useState("5");
  const [timesRented, setTimesRented] = useState("0");
  const [image, setImage] = useState(PLACEHOLDER_IMAGE);
  const [notes, setNotes] = useState("");

  // Maintenance draft
  const [mType, setMType] = useState<MaintenanceEntry["type"]>("cleaning");
  const [mNote, setMNote] = useState("");
  const [mCost, setMCost] = useState("0");
  const [mBy, setMBy] = useState("");

  useEffect(() => {
    if (!open) return;
    if (item) {
      setName(item.name);
      setCategorySlug(item.categorySlug);
      setPriceFrom(String(item.priceFrom));
      setStatus(item.status);
      setPurchasePrice(String(item.purchasePrice));
      setCondition(String(item.condition));
      setTimesRented(String(item.timesRented));
      setImage(item.image);
      setNotes(item.notes);
    } else {
      setName("");
      setCategorySlug(categories[0]?.slug ?? "");
      setPriceFrom("199");
      setStatus("available");
      setPurchasePrice("1800");
      setCondition("5");
      setTimesRented("0");
      setImage(PLACEHOLDER_IMAGE);
      setNotes("");
    }
    setMType("cleaning");
    setMNote("");
    setMCost("0");
    setMBy("");
  }, [item, open]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Item name is required.");
      return;
    }
    const nPrice = Number(priceFrom);
    if (!Number.isFinite(nPrice) || nPrice <= 0) {
      toast.error("Enter a valid rental price.");
      return;
    }

    const payload = {
      name: name.trim(),
      slug: name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      categorySlug,
      image: image.trim() || PLACEHOLDER_IMAGE,
      alt: name.trim(),
      priceFrom: nPrice,
      status,
      timesRented: Number(timesRented) || 0,
      purchasePrice: Number(purchasePrice) || 0,
      condition: (Number(condition) || 5) as 1 | 2 | 3 | 4 | 5,
      notes: notes.trim(),
    };

    if (isCreate) {
      inventoryActions.create({ ...payload, purchasedAt: new Date() });
      toast.success(`${payload.name} added to inventory`);
    } else {
      inventoryActions.update(item.id, payload);
      toast.success("Inventory item updated");
    }
    onOpenChange(false);
  };

  const handleAddMaintenance = () => {
    if (!item) return;
    if (!mNote.trim()) {
      toast.error("Describe what was done.");
      return;
    }
    inventoryActions.addMaintenance(item.id, {
      at: new Date(),
      type: mType,
      note: mNote.trim(),
      cost: Number(mCost) || 0,
      performedBy: mBy.trim() || "Unassigned",
    });
    setMNote("");
    setMCost("0");
    setMBy("");
    toast.success("Maintenance logged");
  };

  const maintenanceTotal = item?.maintenance.reduce((s, m) => s + m.cost, 0) ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add inventory item" : "Edit inventory item"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Register a new rental unit so it can be scheduled and tracked."
              : `${item.name} · rented ${item.timesRented} times`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            {!isCreate && (
              <TabsTrigger value="maintenance">Maintenance ({item.maintenance.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-bold">Item name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Castle Bounce House"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Category</Label>
                <Select value={categorySlug} onValueChange={setCategorySlug}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs font-bold">Rental price</Label>
                <Input
                  type="number"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Purchase cost</Label>
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Times rented</Label>
                <Input
                  type="number"
                  value={timesRented}
                  onChange={(e) => setTimesRented(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-bold">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as InventoryStatus)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/-/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold">Condition (1–5)</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 — Like new</SelectItem>
                    <SelectItem value="4">4 — Good</SelectItem>
                    <SelectItem value="3">3 — Fair</SelectItem>
                    <SelectItem value="2">2 — Worn</SelectItem>
                    <SelectItem value="1">1 — Needs replacement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">Image URL</Label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="mt-1"
                placeholder="https://…"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Internal notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1"
                placeholder="Storage location, blower size, known quirks…"
              />
            </div>

            {!isCreate && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Revenue generated (est.)</span>
                  <span>{formatMoney(item.timesRented * item.priceFrom)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Maintenance spend</span>
                  <span>{formatMoney(maintenanceTotal)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-border pt-1 font-extrabold">
                  <span>Net contribution</span>
                  <span>
                    {formatMoney(
                      item.timesRented * item.priceFrom - item.purchasePrice - maintenanceTotal,
                    )}
                  </span>
                </div>
              </div>
            )}
          </TabsContent>

          {!isCreate && (
            <TabsContent value="maintenance" className="space-y-4 pt-4">
              <div className="space-y-3 rounded-lg border border-border p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Wrench className="size-3" /> Log new service
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Select
                    value={mType}
                    onValueChange={(v) => setMType(v as MaintenanceEntry["type"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={mCost}
                    onChange={(e) => setMCost(e.target.value)}
                    placeholder="Cost"
                  />
                  <Input
                    value={mBy}
                    onChange={(e) => setMBy(e.target.value)}
                    placeholder="Performed by"
                  />
                </div>
                <Textarea
                  value={mNote}
                  onChange={(e) => setMNote(e.target.value)}
                  rows={2}
                  placeholder="What was done?"
                />
                <Button size="sm" onClick={handleAddMaintenance}>
                  <Plus className="size-3.5" /> Log service
                </Button>
              </div>

              <Separator />

              {item.maintenance.length === 0 ? (
                <p className="py-6 text-center text-sm font-semibold text-muted-foreground">
                  No maintenance history yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {item.maintenance.map((m) => (
                    <div key={m.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold capitalize">{m.type}</span>
                        <span className="text-sm font-bold">{formatMoney(m.cost)}</span>
                      </div>
                      <p className="mt-1 text-sm">{m.note}</p>
                      <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                        {format(m.at, "MMM d, yyyy")} · {m.performedBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isCreate ? "Add item" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
