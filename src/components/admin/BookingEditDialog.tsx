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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/data/mockBookings";
import type { DeliveryWindow } from "@/data/mockBookings";
import { bookingActions, useAdminState } from "@/data/adminStore";
import type { AdminBooking, AdminBookingStatus, PaymentStatus } from "@/data/adminTypes";

const DELIVERY_WINDOWS: DeliveryWindow[] = [
  "Standard Delivery",
  "Event Day Delivery",
  "1-Hour Window Delivery",
];

const STATUSES: AdminBookingStatus[] = ["open", "sent", "confirmed", "completed", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "deposit-paid", "paid-in-full", "refunded"];

/**
 * Edits the operationally meaningful fields of a booking and recomputes the
 * money math from live settings so totals can never drift out of sync.
 */
export function BookingEditDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: AdminBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { settings } = useAdminState();

  const [eventDate, setEventDate] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState<DeliveryWindow>("Standard Delivery");
  const [status, setStatus] = useState<AdminBookingStatus>("open");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [instructions, setInstructions] = useState("");
  const [subtotal, setSubtotal] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [discount, setDiscount] = useState("0");

  useEffect(() => {
    if (!booking || !open) return;
    setEventDate(format(booking.eventDate, "yyyy-MM-dd"));
    setDeliveryWindow(booking.deliveryWindow);
    setStatus(booking.status);
    setPaymentStatus(booking.paymentStatus);
    setStreet(booking.address.street);
    setCity(booking.address.city);
    setZip(booking.address.zip);
    setInstructions(booking.instructions);
    setSubtotal(String(booking.subtotal));
    setDeliveryFee(String(booking.deliveryFee));
    setDiscount(String(booking.discount));
  }, [booking, open]);

  if (!booking) return null;

  // Recompute derived money fields from the editable inputs.
  const nSubtotal = Number(subtotal) || 0;
  const nDelivery = Number(deliveryFee) || 0;
  const nDiscount = Number(discount) || 0;
  const taxable = Math.max(0, nSubtotal - nDiscount) + nDelivery;
  const tax = Math.round(taxable * (settings.taxRate / 100) * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;
  const deposit = Math.round(total * (settings.depositPercent / 100) * 100) / 100;
  const balance = Math.round((total - deposit) * 100) / 100;

  const handleSave = () => {
    const parsedDate = new Date(`${eventDate}T12:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Enter a valid event date.");
      return;
    }
    if (!street.trim() || !city.trim()) {
      toast.error("Street and city are required.");
      return;
    }

    bookingActions.update(booking.id, {
      eventDate: parsedDate,
      deliveryWindow,
      status,
      paymentStatus,
      address: { ...booking.address, street: street.trim(), city: city.trim(), zip: zip.trim() },
      instructions: instructions.trim(),
      subtotal: nSubtotal,
      deliveryFee: nDelivery,
      discount: nDiscount,
      tax,
      total,
      deposit,
      balance,
    });
    onOpenChange(false);
    toast.success("Booking updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit booking</DialogTitle>
          <DialogDescription>
            {booking.item.name} · <span className="font-mono">{booking.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold">Event date</Label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Delivery window</Label>
              <Select
                value={deliveryWindow}
                onValueChange={(v) => setDeliveryWindow(v as DeliveryWindow)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_WINDOWS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold">Booking status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AdminBookingStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold">Payment status</Label>
              <Select
                value={paymentStatus}
                onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/-/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Label className="text-xs font-bold">Street</Label>
              <Input value={street} onChange={(e) => setStreet(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-bold">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-bold">ZIP</Label>
              <Input value={zip} onChange={(e) => setZip(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold">Setup instructions</Label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Gate codes, surface type, access notes…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs font-bold">Subtotal</Label>
              <Input
                type="number"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Delivery fee</Label>
              <Input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Discount</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Live recalculation preview */}
          <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Recalculated totals ({settings.taxRate}% tax · {settings.depositPercent}% deposit)
            </p>
            <div className="flex justify-between font-semibold">
              <span>Tax</span>
              <span>{formatMoney(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-extrabold">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
            <div className="flex justify-between font-semibold text-muted-foreground">
              <span>Deposit</span>
              <span>{formatMoney(deposit)}</span>
            </div>
            <div className="flex justify-between font-semibold text-muted-foreground">
              <span>Balance</span>
              <span>{formatMoney(balance)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
