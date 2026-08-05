import { useState } from "react";
import { format } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  DollarSign,
  Mail,
  Phone,
  Plus,
  Send,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatMoney } from "@/data/mockBookings";
import { customerActions, customerMetrics, useAdminState } from "@/data/adminStore";
import type { AdminCustomer, CustomerTag } from "@/data/adminTypes";
import { StatusBadge } from "@/components/admin/AdminPrimitives";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmailComposer } from "@/components/admin/EmailComposer";

const ALL_TAGS: CustomerTag[] = ["vip", "repeat", "new", "at-risk", "corporate", "referral"];

export function CustomerDetailDrawer({
  customer,
  open,
  onOpenChange,
}: {
  customer: AdminCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { bookings, emails } = useAdminState();
  const [editing, setEditing] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  // Draft fields for inline editing
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPhone, setDraftPhone] = useState("");

  if (!customer) return null;

  const metrics = customerMetrics(customer.id, bookings);
  const myBookings = bookings
    .filter((b) => b.customerId === customer.id)
    .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  const myEmails = emails
    .filter((e) => e.recipients.some((r) => r.customerId === customer.id))
    .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());

  const startEdit = () => {
    setDraftName(customer.name);
    setDraftEmail(customer.email);
    setDraftPhone(customer.phone);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!draftName.trim()) {
      toast.error("Name can't be empty.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(draftEmail.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    customerActions.update(customer.id, {
      name: draftName.trim(),
      email: draftEmail.trim(),
      phone: draftPhone.trim(),
    });
    setEditing(false);
    toast.success("Customer updated");
  };

  const handleAddNote = () => {
    if (!noteDraft.trim()) return;
    customerActions.addNote(customer.id, noteDraft.trim());
    setNoteDraft("");
    toast.success("Note added");
  };

  const handleDelete = () => {
    customerActions.remove(customer.id);
    setConfirmDelete(false);
    onOpenChange(false);
    toast.success("Customer deleted");
  };

  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-black text-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="font-display text-lg">{customer.name}</SheetTitle>
                <SheetDescription>
                  Customer since {format(customer.createdAt, "MMM yyyy")}
                  {customer.archived && " · Archived"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Quick actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setEmailOpen(true)}>
              <Send className="size-3.5" /> Email
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${customer.phone.replace(/\D/g, "")}`}>
                <Phone className="size-3.5" /> Call
              </a>
            </Button>
            {!editing && (
              <Button size="sm" variant="outline" onClick={startEdit}>
                Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                customerActions.setArchived(customer.id, !customer.archived);
                toast.success(customer.archived ? "Customer restored" : "Customer archived");
              }}
            >
              {customer.archived ? (
                <>
                  <ArchiveRestore className="size-3.5" /> Restore
                </>
              ) : (
                <>
                  <Archive className="size-3.5" /> Archive
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>

          {/* Lifetime metrics — the numbers that decide how much this relationship is worth */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <MetricTile
              icon={DollarSign}
              label="Lifetime"
              value={formatMoney(metrics.lifetimeValue)}
            />
            <MetricTile icon={CalendarDays} label="Bookings" value={String(metrics.bookingCount)} />
            <MetricTile
              icon={TrendingUp}
              label="Avg order"
              value={formatMoney(metrics.averageOrderValue)}
            />
          </div>

          <Tabs defaultValue="profile" className="mt-5">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">
                Profile
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex-1">
                Bookings ({myBookings.length})
              </TabsTrigger>
              <TabsTrigger value="emails" className="flex-1">
                Emails ({myEmails.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">
                Notes ({customer.notes.length})
              </TabsTrigger>
            </TabsList>

            {/* ── Profile ── */}
            <TabsContent value="profile" className="space-y-4 pt-4">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold">Name</Label>
                    <Input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold">Email</Label>
                    <Input
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold">Phone</Label>
                    <Input
                      value={draftPhone}
                      onChange={(e) => setDraftPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      Save changes
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <Row icon={Mail} label="Email" value={customer.email} />
                  <Row icon={Phone} label="Phone" value={customer.phone} />
                  {customer.address && (
                    <Row
                      icon={CalendarDays}
                      label="Address"
                      value={`${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`}
                    />
                  )}
                  {metrics.lastBookingDate && (
                    <Row
                      icon={CalendarDays}
                      label="Last booking"
                      value={`${format(metrics.lastBookingDate, "MMM d, yyyy")} (${metrics.daysSinceLastBooking} days ago)`}
                    />
                  )}
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Newsletter subscription</p>
                  <p className="text-xs text-muted-foreground">
                    Controls inclusion in marketing segments
                  </p>
                </div>
                <Switch
                  checked={customer.newsletterOptIn}
                  onCheckedChange={(v) => {
                    customerActions.update(customer.id, { newsletterOptIn: v });
                    toast.success(v ? "Subscribed to newsletter" : "Unsubscribed");
                  }}
                />
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAGS.map((tag) => {
                    const active = customer.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => customerActions.toggleTag(customer.id, tag)}
                        className={
                          active
                            ? "rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold capitalize text-primary-foreground"
                            : "rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold capitalize text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                        }
                      >
                        {tag.replace("-", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* ── Bookings ── */}
            <TabsContent value="bookings" className="space-y-2 pt-4">
              {myBookings.length === 0 ? (
                <p className="py-8 text-center text-sm font-semibold text-muted-foreground">
                  This customer hasn&apos;t booked yet.
                </p>
              ) : (
                myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <img
                      src={b.item.image}
                      alt={b.item.alt}
                      className="size-10 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{b.item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(b.eventDate, "MMM d, yyyy")} · {b.address.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatMoney(b.total)}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* ── Emails ── */}
            <TabsContent value="emails" className="space-y-2 pt-4">
              {myEmails.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    No emails sent to this customer yet.
                  </p>
                  <Button size="sm" className="mt-3" onClick={() => setEmailOpen(true)}>
                    <Send className="size-3.5" /> Send the first one
                  </Button>
                </div>
              ) : (
                myEmails.map((e) => (
                  <div key={e.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold">{e.subject}</p>
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {e.kind}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.body}</p>
                    <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                      Sent {format(e.sentAt, "MMM d, yyyy h:mm a")} by {e.sentBy}
                    </p>
                  </div>
                ))
              )}
            </TabsContent>

            {/* ── Notes ── */}
            <TabsContent value="notes" className="space-y-3 pt-4">
              <div className="space-y-2">
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add an internal note — delivery quirks, preferences, complaints…"
                  rows={3}
                />
                <Button size="sm" onClick={handleAddNote} disabled={!noteDraft.trim()}>
                  <Plus className="size-3.5" /> Add note
                </Button>
              </div>

              <Separator />

              {customer.notes.length === 0 ? (
                <p className="py-6 text-center text-sm font-semibold text-muted-foreground">
                  No notes yet.
                </p>
              ) : (
                customer.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-sm">{n.body}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {n.author} · {format(n.createdAt, "MMM d, yyyy h:mm a")}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-destructive"
                        onClick={() => customerActions.removeNote(customer.id, n.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <EmailComposer
        open={emailOpen}
        onOpenChange={setEmailOpen}
        recipients={[customer]}
        booking={myBookings[0] ?? null}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${customer.name}?`}
        description={`This permanently removes the customer and their ${myBookings.length} booking(s). This can't be undone. Consider archiving instead if you only want to hide them.`}
        confirmLabel="Delete permanently"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}

/* ── Local presentational helpers ───────────────────────────────────── */

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3 text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-1 font-display text-base font-black">{value}</p>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <span className="w-24 shrink-0 text-xs font-bold text-muted-foreground">{label}</span>
      <span className="flex-1 break-words font-semibold">{value}</span>
    </div>
  );
}
