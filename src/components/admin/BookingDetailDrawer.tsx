import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatMoney } from "@/data/mockBookings";
import { bookingActions, useAdminState } from "@/data/adminStore";
import type { AdminBooking, PaymentStatus } from "@/data/adminTypes";
import { StatusBadge } from "@/components/admin/AdminPrimitives";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmailComposer } from "@/components/admin/EmailComposer";
import { BookingEditDialog } from "@/components/admin/BookingEditDialog";

const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "deposit-paid", "paid-in-full", "refunded"];

export function BookingDetailDrawer({
  booking,
  open,
  onOpenChange,
}: {
  booking: AdminBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { customers } = useAdminState();
  const [emailOpen, setEmailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const customer = booking ? customers.find((c) => c.id === booking.customerId) : undefined;

  const handleDelete = () => {
    if (!booking) return;
    bookingActions.remove(booking.id);
    setConfirmDelete(false);
    onOpenChange(false);
    toast.success("Booking deleted");
  };

  const handleCancel = () => {
    if (!booking) return;
    bookingActions.setStatus(booking.id, "cancelled");
    setConfirmCancel(false);
    toast.success("Booking cancelled");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {booking && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="font-display text-lg">Booking Details</SheetTitle>
                  <StatusBadge status={booking.status} />
                </div>
                <SheetDescription>
                  Booking ID: <span className="font-mono">{booking.id}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Item */}
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{booking.item.name}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {booking.category.name}
                    </p>
                  </div>
                  <img
                    src={booking.item.image}
                    alt={booking.item.alt}
                    className="size-12 rounded-lg object-cover"
                  />
                </div>

                <Separator />

                {/* Customer & date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      <User className="size-3" /> Customer
                    </p>
                    <p className="text-sm font-semibold">{customer?.name ?? "Unknown"}</p>
                    {customer && (
                      <>
                        <a
                          href={`mailto:${customer.email}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Mail className="size-3" /> {customer.email}
                        </a>
                        <a
                          href={`tel:${customer.phone.replace(/\D/g, "")}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Phone className="size-3" /> {customer.phone}
                        </a>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      <Calendar className="size-3" /> Event Date
                    </p>
                    <p className="text-sm font-semibold">
                      {format(booking.eventDate, "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.deliveryWindow}</p>
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <MapPin className="size-3" /> Delivery Address
                  </p>
                  <p className="text-sm font-semibold">{booking.address.street}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.address.city}, {booking.address.state} {booking.address.zip}
                  </p>
                </div>

                {booking.instructions && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Instructions
                      </p>
                      <p className="text-sm">{booking.instructions}</p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Financial breakdown */}
                <div>
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <DollarSign className="size-3" /> Payment Summary
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{formatMoney(booking.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="font-semibold">
                        {booking.deliveryFee === 0 ? "Free" : formatMoney(booking.deliveryFee)}
                      </span>
                    </div>
                    {booking.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Discount{booking.promoCode ? ` (${booking.promoCode})` : ""}
                        </span>
                        <span className="font-semibold text-emerald-600">
                          −{formatMoney(booking.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">{formatMoney(booking.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-display text-base font-black">
                        {formatMoney(booking.total)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit Paid</span>
                      <span className="font-semibold text-emerald-600">
                        {formatMoney(booking.deposit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance Due</span>
                      <span className="font-semibold text-amber-600">
                        {formatMoney(booking.balance)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment status control */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Payment Status
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {booking.paymentStatus.replace(/-/g, " ")}
                    </Badge>
                    <Select
                      value={booking.paymentStatus}
                      onValueChange={(v) => {
                        bookingActions.setPaymentStatus(booking.id, v as PaymentStatus);
                        toast.success("Payment status updated");
                      }}
                    >
                      <SelectTrigger className="h-8 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s.replace(/-/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button onClick={() => setEmailOpen(true)} disabled={!customer}>
                    <Mail className="size-4" /> Send Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <Pencil className="size-4" /> Edit
                  </Button>

                  {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        bookingActions.setStatus(booking.id, "confirmed");
                        toast.success("Booking confirmed");
                      }}
                    >
                      <CheckCircle2 className="size-4" /> Confirm
                    </Button>
                  )}

                  {booking.status !== "completed" && booking.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        bookingActions.setStatus(booking.id, "completed");
                        toast.success("Marked complete");
                      }}
                    >
                      <CheckCircle2 className="size-4" /> Complete
                    </Button>
                  )}

                  {booking.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      className="text-amber-600 hover:text-amber-700"
                      onClick={() => setConfirmCancel(true)}
                    >
                      <XCircle className="size-4" /> Cancel
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Created {format(booking.createdAt, "MMM d, yyyy")} · Updated{" "}
                  {format(booking.updatedAt, "MMM d, yyyy")}
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {customer && (
        <EmailComposer
          open={emailOpen}
          onOpenChange={setEmailOpen}
          recipients={[customer]}
          booking={booking}
          defaultTemplateId="tpl-invoice"
        />
      )}

      <BookingEditDialog booking={booking} open={editOpen} onOpenChange={setEditOpen} />

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this booking?"
        description="The booking stays on record but is excluded from revenue reporting. You can reactivate it later by changing its status."
        confirmLabel="Cancel booking"
        cancelLabel="Keep it"
        onConfirm={handleCancel}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this booking?"
        description="This permanently removes the booking and its revenue history. Cancelling instead preserves the audit trail."
        confirmLabel="Delete permanently"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
