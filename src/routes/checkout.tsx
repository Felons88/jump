import { useCallback, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Check, CreditCard, Loader2, Lock, MapPin, Tag, Truck, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressAutocomplete } from "@/components/site/AddressAutocomplete";
import { useCart } from "@/data/cart";
import { useAuth } from "@/data/auth";
import {
  addBooking,
  formatMoney,
  type BookingRequest,
  type DeliveryWindow,
} from "@/data/mockBookings";
import { deliveryOptions } from "@/data/site";
import { validatePromoCode, type PromoResult } from "@/data/promoCodes";
import { geocodeAddress, hasMapboxToken } from "@/lib/mapbox";
import { matchServiceArea, type MatchedServiceArea } from "@/lib/serviceArea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout | Jump City" }],
  }),
  component: CheckoutPage,
});

const MN_TAX_RATE = 0.07375;

function parseDeliveryPrice(name: DeliveryWindow): number {
  const option = deliveryOptions.find((o) => o.name === name);
  const digits = option?.price.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function CheckoutPage() {
  const { lines, subtotal, eventDate, pickupDate, rentalDays, clear } = useCart();
  const { customer, signUp, addBookingToAccount } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [deliveryWindow, setDeliveryWindow] = useState<DeliveryWindow>("Standard Delivery");
  const [street, setStreet] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [zip, setZip] = useState("");
  const [instructions, setInstructions] = useState("");
  const [resolvedCity, setResolvedCity] = useState("");
  const [resolvedState, setResolvedState] = useState("MN");
  const [serviceArea, setServiceArea] = useState<MatchedServiceArea | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [outsideArea, setOutsideArea] = useState(false);
  const [resolving, setResolving] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<PromoResult>({ ok: false, discount: 0 });
  const [promoApplied, setPromoApplied] = useState(false);

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [bookingId, setBookingId] = useState<string | null>(null);

  // Payment state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [payFull, setPayFull] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const resetAddressMatch = () => {
    setServiceArea(null);
    setResolvedCity("");
    setAddressError(null);
    setOutsideArea(false);
  };

  const resolveAddress = useCallback(
    async (text: string) => {
      const query = text.trim();
      if (!query) {
        resetAddressMatch();
        return;
      }
      if (!hasMapboxToken) {
        setAddressError(
          "Address lookup is unavailable — we'll confirm your delivery area by phone.",
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

  const invoice = useMemo(() => {
    const minimum = serviceArea?.freeDeliveryThreshold ?? 175;
    const standardFee = serviceArea?.standardFee ?? 49;

    let deliveryFee = 0;
    if (deliveryWindow === "Standard Delivery") {
      deliveryFee = subtotal >= minimum ? 0 : standardFee;
    } else {
      deliveryFee = parseDeliveryPrice(deliveryWindow);
    }

    const discount = promoApplied ? promoResult.discount : 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const taxable = discountedSubtotal + deliveryFee;
    const tax = Math.round(taxable * MN_TAX_RATE * 100) / 100;
    const total = Math.round((taxable + tax) * 100) / 100;
    const deposit = Math.round(total * 0.5 * 100) / 100;
    const balance = Math.round((total - deposit) * 100) / 100;

    return { discount, discountedSubtotal, deliveryFee, tax, total, deposit, balance, minimum };
  }, [subtotal, serviceArea, deliveryWindow, promoApplied, promoResult]);

  const cityName = resolvedCity || cityInput.trim();
  const canReview = Boolean(
    eventDate &&
    street.trim() &&
    zip.trim() &&
    cityName &&
    serviceArea &&
    !outsideArea &&
    !resolving &&
    lines.length > 0,
  );

  const handleApplyPromo = () => {
    const result = validatePromoCode(promoInput, subtotal);
    setPromoResult(result);
    setPromoApplied(result.ok);
    if (result.ok) {
      toast.success(`Promo code applied — you saved ${formatMoney(result.discount)}!`);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleRemovePromo = () => {
    setPromoInput("");
    setPromoResult({ ok: false, discount: 0 });
    setPromoApplied(false);
  };

  const createBookingRecord = (): BookingRequest => {
    const firstLine = lines[0];
    if (!firstLine) throw new Error("Cart is empty");

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    return {
      id,
      item: firstLine.item,
      category: { slug: firstLine.categorySlug, name: firstLine.categoryName } as never,
      eventDate: eventDate ?? new Date(),
      deliveryWindow,
      address: { street, city: cityName, state: resolvedState, zip },
      instructions: instructions.trim(),
      subtotal: invoice.discountedSubtotal,
      deliveryFee: invoice.deliveryFee,
      tax: invoice.tax,
      total: invoice.total,
      deposit: invoice.deposit,
      balance: invoice.balance,
      status: "open",
      createdAt: new Date(),
    };
  };

  const handleCreateAccountAndBook = () => {
    setSignUpError(null);
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setSignUpError("Please fill in all fields.");
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError("Password must be at least 6 characters.");
      return;
    }
    setCreating(true);

    const booking = createBookingRecord();
    addBooking(booking);

    const result = signUp(signUpEmail, signUpPassword, signUpName, signUpPhone);
    if (!result.ok) {
      setSignUpError(result.error ?? "Sign up failed.");
      setCreating(false);
      return;
    }

    addBookingToAccount(booking);
    setCreating(false);
    setStep(3);
    toast.success("Account created!");
  };

  const handleBookAsGuest = () => {
    setStep(3);
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const formatCvc = (val: string) => val.replace(/\D/g, "").slice(0, 4);

  const validateCard = (): string | null => {
    if (!cardName.trim()) return "Please enter the name on your card.";
    if (cardNumber.replace(/\s/g, "").length < 15) return "Please enter a valid card number.";
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return "Please enter a valid expiry date (MM/YY).";
    if (cardCvc.length < 3) return "Please enter a valid CVC.";
    return null;
  };

  const handlePayment = () => {
    const err = validateCard();
    if (err) {
      setPaymentError(err);
      return;
    }
    setPaymentError(null);
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const booking = createBookingRecord();
      addBooking(booking);
      if (customer) addBookingToAccount(booking);
      setBookingId(booking.id);
      setProcessing(false);
      setStep(4);
      toast.success("Payment successful — booking confirmed!");
    }, 2000);
  };

  if (lines.length === 0 && step !== 4) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Your cart is empty</h1>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          Pick a date and add some items to your party first!
        </p>
        <Button asChild className="mt-6">
          <Link to="/rentals">Browse rentals</Link>
        </Button>
      </div>
    );
  }

  if (step === 4 && bookingId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-grass/20">
          <Check className="size-8 text-grass" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold">Booking confirmed!</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Your booking ID is <span className="font-mono font-bold">{bookingId.slice(0, 8)}</span>
        </p>
        <Card className="mt-6 text-left">
          <CardHeader>
            <CardTitle className="text-lg">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-bold">
              Delivery: {format(eventDate ?? new Date(), "MMMM d, yyyy")}
              {pickupDate && ` · Pickup: ${format(pickupDate, "MMMM d, yyyy")}`}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">
              {rentalDays} rental day{rentalDays === 1 ? "" : "s"}
            </p>
            <p className="font-semibold text-muted-foreground">
              Delivery: {deliveryWindow} · {street}, {cityName}, {resolvedState} {zip}
            </p>
            <div className="mt-3 space-y-1 rounded-lg bg-muted/50 p-3">
              {lines.map((line) => (
                <div key={line.item.slug} className="flex justify-between font-semibold">
                  <span>
                    {line.item.name} × {line.quantity}
                  </span>
                  <span>{formatMoney(line.item.priceFrom * line.quantity)}</span>
                </div>
              ))}
              {invoice.discount > 0 && (
                <div className="flex justify-between font-bold text-grass">
                  <span>Discount</span>
                  <span>−{formatMoney(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Delivery</span>
                <span>{invoice.deliveryFee === 0 ? "Free" : formatMoney(invoice.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Tax</span>
                <span>{formatMoney(invoice.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-extrabold">
                <span>Total</span>
                <span>{formatMoney(invoice.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-grass">
                <span>Paid ({payFull ? "Full" : "Deposit 50%"})</span>
                <span>−{formatMoney(payFull ? invoice.total : invoice.deposit)}</span>
              </div>
              {!payFull && (
                <div className="flex justify-between font-semibold text-muted-foreground">
                  <span>Balance before delivery</span>
                  <span>{formatMoney(invoice.balance)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 border-t border-border pt-2 text-xs font-semibold text-muted-foreground">
                <CreditCard className="size-3" />
                <span>
                  {cardName} · ****{cardNumber.replace(/\s/g, "").slice(-4)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {customer && (
            <Button asChild>
              <Link to="/portal">Go to my portal</Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              clear();
              navigate({ to: "/rentals" });
            }}
          >
            Book another party
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Checkout</h1>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">
        {eventDate &&
          `Delivery ${format(eventDate, "MMM d, yyyy")}${
            pickupDate ? ` → Pickup ${format(pickupDate, "MMM d, yyyy")}` : ""
          } · ${rentalDays} rental day${rentalDays === 1 ? "" : "s"}`}
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm font-bold">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full",
            step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          1
        </span>
        <span className={step === 1 ? "text-primary" : "text-muted-foreground"}>
          Delivery details
        </span>
        <span className="text-muted-foreground/40">→</span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full",
            step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          2
        </span>
        <span className={step === 2 ? "text-primary" : "text-muted-foreground"}>
          Review & promo
        </span>
        <span className="text-muted-foreground/40">→</span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full",
            step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          3
        </span>
        <span className={step === 3 ? "text-primary" : "text-muted-foreground"}>Payment</span>
        <span className="text-muted-foreground/40">→</span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full",
            step >= 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          4
        </span>
        <span className={step === 4 ? "text-primary" : "text-muted-foreground"}>Done</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your party items ({lines.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lines.map((line) => (
                    <div key={line.item.slug} className="flex items-center gap-3">
                      <img
                        src={line.item.image}
                        alt={line.item.alt}
                        className="size-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{line.item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.categoryName} × {line.quantity}
                        </p>
                      </div>
                      <span className="font-display text-sm font-black text-primary">
                        {formatMoney(line.item.priceFrom * line.quantity)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="size-4 text-primary" /> Delivery window
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {deliveryOptions.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setDeliveryWindow(opt.name as DeliveryWindow)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border p-3 text-left transition",
                        deliveryWindow === opt.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <div>
                        <p className="text-sm font-bold">{opt.name}</p>
                        <p className="text-xs text-muted-foreground">{opt.detail}</p>
                      </div>
                      <span className="font-display text-sm font-black text-primary">
                        {opt.price}
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="size-4 text-primary" /> Delivery address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="checkout-street" className="text-sm font-bold">
                      Street address
                    </Label>
                    <AddressAutocomplete
                      id="checkout-street"
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
                      <Label htmlFor="checkout-city" className="text-sm font-bold">
                        City
                      </Label>
                      <AddressAutocomplete
                        id="checkout-city"
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
                        placeholder="Minneapolis"
                        loading={resolving}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkout-zip" className="text-sm font-bold">
                        ZIP
                      </Label>
                      <Input
                        id="checkout-zip"
                        value={zip}
                        onChange={(e) => {
                          setZip(e.target.value);
                          resetAddressMatch();
                        }}
                        placeholder="55401"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="checkout-instructions" className="text-sm font-bold">
                      Special instructions <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <textarea
                      id="checkout-instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Gate code, parking details, setup location…"
                      className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {resolving && (
                    <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Looking up address…
                    </p>
                  )}
                  {addressError && (
                    <p className="text-sm font-bold text-destructive">{addressError}</p>
                  )}
                  {serviceArea && !resolving && (
                    <div className="rounded-lg border border-grass/30 bg-grass/10 p-3">
                      <p className="text-sm font-bold text-grass">
                        ✓ Delivery available — {serviceArea.name}
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {serviceArea.note}
                      </p>
                    </div>
                  )}
                  {outsideArea && !resolving && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                      <p className="text-sm font-bold text-destructive">Outside our service area</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Give us a call — we sometimes make exceptions for larger events.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button disabled={!canReview} onClick={() => setStep(2)} size="lg">
                  Review order →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Review your order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between font-bold">
                    <span>Delivery date</span>
                    <span>{format(eventDate ?? new Date(), "MMMM d, yyyy")}</span>
                  </div>
                  {pickupDate && (
                    <div className="flex justify-between font-bold">
                      <span>Pickup date</span>
                      <span>{format(pickupDate, "MMMM d, yyyy")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Rental length</span>
                    <span>
                      {rentalDays} day{rentalDays === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Delivery window</span>
                    <span>{deliveryWindow}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Delivery address</span>
                    <span className="text-right">
                      {street}, {cityName}, {resolvedState} {zip}
                    </span>
                  </div>
                  {instructions && (
                    <div className="rounded-lg bg-muted/50 p-2 text-xs font-semibold text-muted-foreground">
                      Instructions: {instructions}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="size-4 text-primary" /> Promo code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {promoApplied ? (
                    <div className="flex items-center justify-between rounded-lg border border-grass/30 bg-grass/10 p-3">
                      <div>
                        <p className="text-sm font-bold text-grass">
                          ✓ {promoResult.code?.code} applied
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {promoResult.code?.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemovePromo}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter promo code"
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={handleApplyPromo}>
                        Apply
                      </Button>
                    </div>
                  )}
                  {promoResult.error && !promoApplied && (
                    <p className="mt-2 text-sm font-bold text-destructive">{promoResult.error}</p>
                  )}
                </CardContent>
              </Card>

              {!customer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="size-4 text-primary" /> Create your account
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Create an account to track your booking, see your invoice anytime, and book
                      faster next time.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-bold">Full name</Label>
                        <Input
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          placeholder="Jane Smith"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold">Phone</Label>
                        <Input
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          placeholder="(763) 555-0100"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold">Email</Label>
                      <Input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold">Password</Label>
                      <Input
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="mt-1"
                      />
                    </div>
                    {signUpError && (
                      <p className="text-sm font-bold text-destructive">{signUpError}</p>
                    )}
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={creating}
                      onClick={handleCreateAccountAndBook}
                    >
                      {creating ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Creating account…
                        </>
                      ) : (
                        "Create account & continue →"
                      )}
                    </Button>
                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <span className="relative mx-auto bg-card px-2 text-xs font-semibold text-muted-foreground">
                        or
                      </span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleBookAsGuest}>
                      Continue as guest →
                    </Button>
                  </CardContent>
                </Card>
              )}

              {customer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Confirm booking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Logged in as {customer.name}. Your booking will be saved to your account.
                    </p>
                    <Button className="mt-3 w-full" size="lg" onClick={handleBookAsGuest}>
                      Continue to payment →
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  ← Back
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="size-4 text-primary" /> Payment details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs font-semibold text-muted-foreground">
                    <Lock className="size-3.5 shrink-0" />
                    This is a demo checkout — no real payment is processed. Use any card number.
                  </div>

                  {/* Pay deposit vs full */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayFull(false)}
                      className={cn(
                        "rounded-xl border-2 p-4 text-left transition",
                        !payFull
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <p className="text-sm font-extrabold">Deposit (50%)</p>
                      <p className="font-display text-lg font-black text-primary">
                        {formatMoney(invoice.deposit)}
                      </p>
                      <p className="text-xs text-muted-foreground">Pay balance before delivery</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayFull(true)}
                      className={cn(
                        "rounded-xl border-2 p-4 text-left transition",
                        payFull ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <p className="text-sm font-extrabold">Pay in full</p>
                      <p className="font-display text-lg font-black text-primary">
                        {formatMoney(invoice.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">Nothing due later</p>
                    </button>
                  </div>

                  <div>
                    <Label htmlFor="card-name" className="text-sm font-bold">
                      Name on card
                    </Label>
                    <Input
                      id="card-name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Jane Smith"
                      className="mt-1"
                      disabled={processing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-number" className="text-sm font-bold">
                      Card number
                    </Label>
                    <Input
                      id="card-number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      className="mt-1 font-mono"
                      disabled={processing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="card-expiry" className="text-sm font-bold">
                        Expiry
                      </Label>
                      <Input
                        id="card-expiry"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="mt-1 font-mono"
                        disabled={processing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-cvc" className="text-sm font-bold">
                        CVC
                      </Label>
                      <Input
                        id="card-cvc"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(formatCvc(e.target.value))}
                        placeholder="123"
                        className="mt-1 font-mono"
                        disabled={processing}
                      />
                    </div>
                  </div>

                  {paymentError && (
                    <p className="text-sm font-bold text-destructive">{paymentError}</p>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={processing}
                    onClick={handlePayment}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Processing payment…
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" />
                        Pay {formatMoney(payFull ? invoice.total : invoice.deposit)}
                      </>
                    )}
                  </Button>

                  <div className="flex justify-center gap-3 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono">VISA</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono">MC</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono">AMEX</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono">DISC</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)} disabled={processing}>
                  ← Back
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {lines.map((line) => (
                <div key={line.item.slug} className="flex justify-between font-semibold">
                  <span className="truncate pr-2">
                    {line.item.name} × {line.quantity}
                  </span>
                  <span>{formatMoney(line.item.priceFrom * line.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2" />
              <div className="flex justify-between font-bold">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between font-bold text-grass">
                  <span>Discount</span>
                  <span>−{formatMoney(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Delivery</span>
                <span>{invoice.deliveryFee === 0 ? "Free" : formatMoney(invoice.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Tax (7.375%)</span>
                <span>{formatMoney(invoice.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-extrabold">
                <span>Total</span>
                <span className="text-primary">{formatMoney(invoice.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-primary">
                <span>Deposit due now (50%)</span>
                <span>{formatMoney(invoice.deposit)}</span>
              </div>
              <div className="flex justify-between font-semibold text-muted-foreground">
                <span>Balance before delivery</span>
                <span>{formatMoney(invoice.balance)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
