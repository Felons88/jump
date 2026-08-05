import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format, isBefore, isSameDay, startOfDay } from "date-fns";
import { AlertTriangle, Ban, Calendar as CalendarIcon, Check, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/site/AddressAutocomplete";
import { deliveryOptions, type Category, type RentalItem } from "@/data/site";
import { addBooking, formatMoney, type DeliveryWindow } from "@/data/mockBookings";
import { geocodeAddress, hasMapboxToken } from "@/lib/mapbox";
import { matchServiceArea, type MatchedServiceArea } from "@/lib/serviceArea";
import { cn } from "@/lib/utils";

const MN_TAX_RATE = 0.06875;

const deliveryTimeSummary: Record<DeliveryWindow, string> = {
  "Standard Delivery": "Delivered 12–48 hours ahead of your event.",
  "Event Day Delivery": "Arrives as early as 11am on your event day.",
  "1-Hour Window Delivery": "You'll confirm an exact 1-hour arrival window before delivery.",
};

function getMockBookedDates(item: RentalItem): Date[] {
  const today = startOfDay(new Date());
  const out: Date[] = [];
  const seedBase = item.slug.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  for (let i = 1; i <= 60 && out.length < 10; i++) {
    const d = addDays(today, i);
    const code = seedBase + d.getDate() + d.getMonth();
    if (code % 7 === 0) out.push(d);
  }
  return out;
}

function parseDeliveryPrice(name: DeliveryWindow): number {
  const option = deliveryOptions.find((o) => o.name === name);
  const digits = option?.price.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function calculateInvoice(
  item: RentalItem,
  area: MatchedServiceArea | null,
  window: DeliveryWindow,
) {
  const subtotal = item.priceFrom;
  const minimum = area?.freeDeliveryThreshold ?? 175;
  const standardFee = area?.standardFee ?? 49;

  let deliveryFee = 0;
  if (window === "Standard Delivery") {
    deliveryFee = subtotal >= minimum ? 0 : standardFee;
  } else {
    deliveryFee = parseDeliveryPrice(window);
  }

  // Minnesota base state sales tax. Real local/city add-on rates vary and
  // should be calculated by a real tax service before going live.
  const taxable = subtotal + deliveryFee;
  const tax = Math.round(taxable * MN_TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;
  const deposit = Math.round(total * 0.5 * 100) / 100;
  const balance = Math.round((total - deposit) * 100) / 100;

  return { subtotal, deliveryFee, tax, total, deposit, balance, minimum };
}

export function BookingFlow({ item, category }: { item: RentalItem; category: Category }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>();
  const [deliveryWindow, setDeliveryWindow] = useState<DeliveryWindow>("Standard Delivery");
  const [street, setStreet] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [zip, setZip] = useState("");
  const [instructions, setInstructions] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [resolving, setResolving] = useState(false);
  const [resolvedCity, setResolvedCity] = useState("");
  const [resolvedState, setResolvedState] = useState("MN");
  const [serviceArea, setServiceArea] = useState<MatchedServiceArea | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [outsideArea, setOutsideArea] = useState(false);

  const bookedDates = useMemo(() => getMockBookedDates(item), [item]);

  const resetAddressMatch = () => {
    setServiceArea(null);
    setResolvedCity("");
    setAddressError(null);
    setOutsideArea(false);
  };

  useEffect(() => {
    if (open) {
      setStep(1);
      setDate(undefined);
      setDeliveryWindow("Standard Delivery");
      setStreet("");
      setCityInput("");
      setZip("");
      setInstructions("");
      setBookingId(null);
      setResolving(false);
      setResolvedState("MN");
      resetAddressMatch();
    }
  }, [open, item]);

  /** Geocodes whatever the customer typed and matches the nearest hub. */
  const resolveAddress = useCallback(
    async (text: string) => {
      const query = text.trim();
      if (!query) {
        resetAddressMatch();
        return;
      }
      if (!hasMapboxToken) {
        setAddressError(
          "Address lookup is unavailable right now — we'll confirm your delivery area by phone.",
        );
        return;
      }

      setResolving(true);
      setAddressError(null);
      setOutsideArea(false);
      try {
        const geocoded = await geocodeAddress(query);
        if (!geocoded) {
          setServiceArea(null);
          setAddressError("We couldn't find that address. Try adding the city and state.");
          return;
        }

        setResolvedCity(geocoded.city || query);
        if (geocoded.state) setResolvedState(geocoded.state);
        if (geocoded.zip && !zip.trim()) setZip(geocoded.zip);

        const matched = matchServiceArea(geocoded);
        setServiceArea(matched);
        setOutsideArea(matched === null);
      } catch {
        setServiceArea(null);
        setAddressError("Address lookup failed. Give us a call and we'll sort out delivery.");
      } finally {
        setResolving(false);
      }
    },
    [zip],
  );

  const invoice = useMemo(
    () => calculateInvoice(item, serviceArea, deliveryWindow),
    [item, serviceArea, deliveryWindow],
  );

  const cityName = resolvedCity || cityInput.trim();
  const canReview = Boolean(
    date && street.trim() && zip.trim() && cityName && serviceArea && !outsideArea && !resolving,
  );

  const handleSubmit = () => {
    if (!date) return;
    const id =
      typeof globalThis !== "undefined" && "crypto" in globalThis
        ? globalThis.crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    addBooking({
      id,
      item,
      category,
      eventDate: date,
      deliveryWindow,
      address: { street, city: cityName, state: resolvedState, zip },
      instructions: instructions.trim(),
      ...invoice,
      status: "open",
      createdAt: new Date(),
    });
    setBookingId(id);
    setStep(4);
  };

  const isBooked = (d: Date) => bookedDates.some((b) => isSameDay(d, b));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="lg" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        <CalendarIcon className="size-4" /> Check Your Date
      </Button>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-left text-xl">Book {item.name}</DialogTitle>
          <DialogDescription className="text-left">
            Demo booking request — no real payment or charge.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <span
            className={cn(
              "rounded-full px-2 py-0.5",
              step === 1 && "bg-primary text-primary-foreground",
            )}
          >
            1. Date
          </span>
          <span>→</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5",
              step === 2 && "bg-primary text-primary-foreground",
            )}
          >
            2. Delivery
          </span>
          <span>→</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5",
              step === 3 && "bg-primary text-primary-foreground",
            )}
          >
            3. Review
          </span>
          <span>→</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5",
              step === 4 && "bg-primary text-primary-foreground",
            )}
          >
            4. Done
          </span>
        </div>

        {step === 1 && (
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3 text-sm">
              <Ban className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="font-semibold text-muted-foreground">
                Booked dates are greyed and blocked. Available future dates are white.
              </p>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d && !isBooked(d) && !isBefore(startOfDay(d), startOfDay(new Date()))) {
                  setDate(d);
                }
              }}
              disabled={[(d) => isBefore(startOfDay(d), startOfDay(new Date())), ...bookedDates]}
              modifiers={{ booked: bookedDates }}
              modifiersClassNames={{ booked: "text-muted-foreground opacity-50" }}
              className="mx-auto"
            />
            <div className="flex justify-end">
              <Button disabled={!date} onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-5">
            <div>
              <Label className="text-sm font-bold">Delivery window</Label>
              <RadioGroup
                value={deliveryWindow}
                onValueChange={(v) => setDeliveryWindow(v as DeliveryWindow)}
                className="mt-2 grid gap-3"
              >
                {deliveryOptions.map((option) => {
                  const selected = deliveryWindow === option.name;
                  return (
                    <div
                      key={option.name}
                      onClick={() => setDeliveryWindow(option.name as DeliveryWindow)}
                      className={cn(
                        "relative cursor-pointer rounded-xl border p-3 transition",
                        selected ? "border-primary bg-primary/5" : "border-border bg-card",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={option.name} id={option.name} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={option.name} className="font-extrabold">
                              {option.name}
                            </Label>
                            <span className="font-display text-lg font-black text-primary">
                              {option.price}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {option.sub}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-muted-foreground">
                            {option.detail}
                          </p>
                          <p className="mt-1 text-xs font-bold text-secondary">
                            {deliveryTimeSummary[option.name as DeliveryWindow]}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="booking-street" className="text-sm font-bold">
                  Street address
                </Label>
                <AddressAutocomplete
                  id="booking-street"
                  value={street}
                  onValueChange={(v) => {
                    setStreet(v);
                    resetAddressMatch();
                  }}
                  onSelect={(s) => {
                    if (s.city) setCityInput(s.city);
                    if (s.zip) setZip(s.zip);
                    if (s.state) setResolvedState(s.state);
                  }}
                  onCommit={(v) => {
                    const full = [v, cityInput, zip].filter(Boolean).join(", ");
                    resolveAddress(full);
                  }}
                  placeholder="123 Maple St"
                  loading={resolving}
                  className="mt-1"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                <div>
                  <Label htmlFor="booking-city" className="text-sm font-bold">
                    City or town
                  </Label>
                  <AddressAutocomplete
                    id="booking-city"
                    value={cityInput}
                    onValueChange={(v) => {
                      setCityInput(v);
                      resetAddressMatch();
                    }}
                    onSelect={(s) => {
                      if (s.zip) setZip(s.zip);
                      if (s.state) setResolvedState(s.state);
                    }}
                    onCommit={(v) => {
                      const full = [street, v, zip].filter(Boolean).join(", ");
                      resolveAddress(full);
                    }}
                    placeholder="Start typing your city…"
                    loading={resolving}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    Any Minnesota city — we'll match it to the closest service area.
                  </p>
                </div>
                <div>
                  <Label htmlFor="booking-zip" className="text-sm font-bold">
                    ZIP
                  </Label>
                  <Input
                    id="booking-zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="55401"
                    className="mt-1"
                    maxLength={10}
                  />
                </div>
              </div>

              {resolving && (
                <p className="text-sm font-semibold text-muted-foreground">
                  Checking your delivery area…
                </p>
              )}

              {!resolving && serviceArea && (
                <div className="rounded-xl border border-border bg-muted/50 p-3">
                  <p className="flex items-start gap-2 text-sm font-bold">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      Delivery pricing based on our {serviceArea.name} service area — nearest to{" "}
                      {cityName}
                      {resolvedState ? `, ${resolvedState}` : ""}.
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {serviceArea.note} · about {Math.round(serviceArea.distanceMiles)} mi from our{" "}
                    {serviceArea.nearestHubName} hub.
                  </p>
                  <p className="mt-2 text-sm font-extrabold">
                    {deliveryWindow}:{" "}
                    {invoice.deliveryFee === 0 ? "Free" : formatMoney(invoice.deliveryFee)}
                  </p>
                </div>
              )}

              {!resolving && outsideArea && (
                <p className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm font-bold text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    That address is outside our current service area. Give us a call and we'll let
                    you know what we can do.
                  </span>
                </p>
              )}

              {!resolving && addressError && (
                <p className="text-sm font-bold text-destructive">{addressError}</p>
              )}
              <div>
                <Label htmlFor="booking-instructions" className="text-sm font-bold">
                  Special instructions
                </Label>
                <Textarea
                  id="booking-instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Gate code, surface type, setup access..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={!canReview} onClick={() => setStep(3)}>
                Review invoice
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-display text-lg font-extrabold">Order summary</h3>
              <div className="mt-3 space-y-2 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span>{formatMoney(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{deliveryWindow}</span>
                  <span>{formatMoney(invoice.deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MN sales tax (6.875%)</span>
                  <span>{formatMoney(invoice.tax)}</span>
                </div>
                <div className="mt-2 border-t pt-2">
                  <div className="flex justify-between text-base font-extrabold">
                    <span>Total</span>
                    <span>{formatMoney(invoice.total)}</span>
                  </div>
                </div>
                <div className="mt-2 grid gap-1 rounded-xl bg-muted/50 p-3 text-sm">
                  <div className="flex justify-between font-bold">
                    <span>Deposit due now (50%)</span>
                    <span>{formatMoney(invoice.deposit)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-muted-foreground">
                    <span>Balance before delivery</span>
                    <span>{formatMoney(invoice.balance)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-3 text-xs font-semibold text-muted-foreground">
              Date: {date ? format(date, "MMMM d, yyyy") : ""} · {deliveryWindow} · {street},{" "}
              {cityName}, {resolvedState} {zip}
              {serviceArea && <p className="mt-1">Service area: {serviceArea.name}</p>}
              {instructions && <p className="mt-1 italic">Notes: {instructions}</p>}
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit}>Request booking</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-4 space-y-4 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-grass/20">
              <Check className="size-7 text-grass" />
            </div>
            <h3 className="text-2xl font-extrabold">Booking request sent</h3>
            <p className="font-semibold text-muted-foreground">
              Your booking request is under review. An invoice will be emailed once our team
              confirms the details.
            </p>
            <div className="rounded-2xl border border-border bg-card p-4 text-left text-sm">
              <p className="font-bold text-muted-foreground">
                Open Invoice — Pending Manager Review
              </p>
              <p className="mt-1 font-extrabold">Booking ID: {bookingId}</p>
              <p className="mt-1 font-semibold">Total: {formatMoney(invoice.total)}</p>
              <p className="font-semibold">Deposit: {formatMoney(invoice.deposit)}</p>
            </div>
            <Button onClick={() => setOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
