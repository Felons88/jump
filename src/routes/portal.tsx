import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ChevronRight,
  Clock,
  FileText,
  History,
  Mail,
  MapPin,
  Package,
  Star,
  Truck,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/data/auth";
import { formatMoney, type BookingRequest } from "@/data/mockBookings";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [{ title: "My Portal | Jump City" }],
  }),
  component: PortalPage,
});

function PortalPage() {
  const { customer, logIn, logOut, updateProfile, setNewsletterOptIn, addReview } = useAuth();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [editName, setEditName] = useState(customer?.name ?? "");
  const [editPhone, setEditPhone] = useState(customer?.phone ?? "");

  const [reviewBooking, setReviewBooking] = useState<BookingRequest | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [detailBooking, setDetailBooking] = useState<BookingRequest | null>(null);

  if (!customer) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-extrabold text-center">Client Portal</h1>
        <p className="mt-2 text-center text-sm font-semibold text-muted-foreground">
          Log in to see your invoices, past rentals, and reviews.
        </p>
        <Card className="mt-6">
          <CardContent className="space-y-3 pt-6">
            <div>
              <Label className="text-xs font-bold">Email</Label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="jane@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Password</Label>
              <Input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Your password"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const result = logIn(loginEmail, loginPassword);
                    if (!result.ok) setLoginError(result.error ?? "Login failed.");
                    else {
                      setLoginError(null);
                      toast.success("Welcome back!");
                    }
                  }
                }}
              />
            </div>
            {loginError && <p className="text-sm font-bold text-destructive">{loginError}</p>}
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                const result = logIn(loginEmail, loginPassword);
                if (!result.ok) setLoginError(result.error ?? "Login failed.");
                else {
                  setLoginError(null);
                  toast.success("Welcome back!");
                }
              }}
            >
              <LogIn className="size-4" /> Log in
            </Button>
            <p className="text-center text-sm font-semibold text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/rentals" className="font-bold text-primary hover:underline">
                Book a party
              </Link>{" "}
              to create one.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateProfile(editName, editPhone);
    toast.success("Profile updated!");
  };

  const handleSubmitReview = () => {
    if (!reviewBooking || !reviewText.trim()) return;
    addReview(reviewBooking.item.slug, reviewRating, reviewText.trim());
    setReviewBooking(null);
    setReviewText("");
    setReviewRating(5);
    toast.success("Review submitted — thank you!");
  };

  const completedBookings = customer.bookings.filter((b) => b.status === "sent");
  const openBookings = customer.bookings.filter((b) => b.status === "open");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">My Portal</h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Welcome back, {customer.name}!
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" /> Log out
        </Button>
      </div>

      <Tabs defaultValue="invoices" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="invoices" className="text-xs sm:text-sm">
            <FileText className="mr-1 size-4" /> Invoices
          </TabsTrigger>
          <TabsTrigger value="rentals" className="text-xs sm:text-sm">
            <History className="mr-1 size-4" /> Rentals
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm">
            <Star className="mr-1 size-4" /> Reviews
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">
            <User className="mr-1 size-4" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Invoices */}
        <TabsContent value="invoices" className="mt-4 space-y-3">
          {customer.bookings.length === 0 ? (
            <EmptyState message="No invoices yet. Book a party to see your invoices here!" />
          ) : (
            customer.bookings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setDetailBooking(b)}
                className="w-full text-left"
                aria-label={`View rental details for ${b.item.name}`}
              >
                <Card className="transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-pop">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.item.image}
                        alt={b.item.alt}
                        className="size-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold">{b.item.name}</p>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {format(b.eventDate, "MMM d, yyyy")} · {b.deliveryWindow}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.address.street}, {b.address.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-display text-lg font-black text-primary">
                          {formatMoney(b.total)}
                        </p>
                        <Badge
                          variant={b.status === "sent" ? "secondary" : "default"}
                          className="mt-1"
                        >
                          {b.status === "sent" ? "Invoice sent" : "Open"}
                        </Badge>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))
          )}
        </TabsContent>

        {/* Past Rentals */}
        <TabsContent value="rentals" className="mt-4 space-y-3">
          {openBookings.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-primary">
                Upcoming
              </h3>
              {openBookings.map((b) => (
                <Card key={b.id}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <img
                      src={b.item.image}
                      alt={b.item.alt}
                      className="size-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{b.item.name}</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {format(b.eventDate, "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.deliveryWindow} · {b.address.street}, {b.address.city}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDetailBooking(b)}>
                      <FileText className="size-4" /> Details
                    </Button>
                    <Badge>Upcoming</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {completedBookings.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                Past rentals
              </h3>
              {completedBookings.map((b) => (
                <Card key={b.id}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <img
                      src={b.item.image}
                      alt={b.item.alt}
                      className="size-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{b.item.name}</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {format(b.eventDate, "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDetailBooking(b)}>
                      <FileText className="size-4" /> Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReviewBooking(b);
                        setReviewRating(5);
                        setReviewText("");
                      }}
                    >
                      <Star className="size-4" /> Leave a review
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {customer.bookings.length === 0 && (
            <EmptyState message="No rentals yet. Your booking history will appear here." />
          )}
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="mt-4 space-y-3">
          {reviewBooking && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">Review: {reviewBooking.item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-bold">Rating</Label>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setReviewRating(n)} aria-label={`${n} stars`}>
                        <Star
                          className={`size-6 ${n <= reviewRating ? "fill-secondary text-secondary" : "text-muted-foreground/40"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold">Your review</Label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience…"
                    className="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmitReview} disabled={!reviewText.trim()}>
                    Submit review
                  </Button>
                  <Button variant="ghost" onClick={() => setReviewBooking(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {customer.reviews.length === 0 && !reviewBooking ? (
            <EmptyState message="No reviews yet. Leave a review from your past rentals tab!" />
          ) : (
            customer.reviews.map((r, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`size-4 ${n <= r.rating ? "fill-secondary text-secondary" : "text-muted-foreground/40"}`}
                      />
                    ))}
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">
                      {format(r.createdAt, "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{r.text}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-bold">Full name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">Phone</Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold">Email</Label>
                <Input value={customer.email} disabled className="mt-1 opacity-60" />
              </div>
              <Button onClick={handleSaveProfile}>Save changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4 text-primary" /> Newsletter & marketing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Receive special offers and updates</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Get notified about seasonal discounts and new inventory.
                  </p>
                </div>
                <Switch
                  checked={customer.newsletterOptIn}
                  onCheckedChange={(checked) => {
                    setNewsletterOptIn(checked);
                    toast.success(
                      checked ? "Subscribed to newsletter!" : "Unsubscribed from newsletter.",
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RentalDetailDialog
        booking={detailBooking}
        customerName={customer.name}
        customerEmail={customer.email}
        customerPhone={customer.phone}
        onClose={() => setDetailBooking(null)}
        onReview={(b) => {
          setDetailBooking(null);
          setReviewBooking(b);
          setReviewRating(5);
          setReviewText("");
        }}
      />
    </div>
  );
}

/** Full rental + invoice breakdown for a single booking. */
function RentalDetailDialog({
  booking,
  customerName,
  customerEmail,
  customerPhone,
  onClose,
  onReview,
}: {
  booking: BookingRequest | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onClose: () => void;
  onReview: (b: BookingRequest) => void;
}) {
  return (
    <Dialog
      open={Boolean(booking)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {booking && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Rental details</DialogTitle>
              <DialogDescription>
                Invoice #{booking.id.slice(0, 8).toUpperCase()} · booked{" "}
                {format(booking.createdAt, "MMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>

            {/* Item */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
              <img
                src={booking.item.image}
                alt={booking.item.alt}
                className="size-20 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="font-display text-lg font-black leading-tight">{booking.item.name}</p>
                <p className="text-xs font-bold text-primary">{booking.category.name}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {booking.item.dimensions} · {booking.item.ages}
                </p>
              </div>
            </div>

            {/* Schedule + address */}
            <div className="space-y-2">
              <DetailRow
                icon={<Clock className="size-4 text-primary" />}
                label="Event date"
                value={format(booking.eventDate, "EEEE, MMMM d, yyyy")}
              />
              <DetailRow
                icon={<Truck className="size-4 text-primary" />}
                label="Delivery window"
                value={booking.deliveryWindow}
              />
              <DetailRow
                icon={<MapPin className="size-4 text-primary" />}
                label="Delivery address"
                value={`${booking.address.street}, ${booking.address.city}, ${booking.address.state} ${booking.address.zip}`}
              />
              <DetailRow
                icon={<User className="size-4 text-primary" />}
                label="Contact"
                value={`${customerName} · ${customerPhone || customerEmail}`}
              />
              {booking.instructions && (
                <DetailRow
                  icon={<Package className="size-4 text-primary" />}
                  label="Setup notes"
                  value={booking.instructions}
                />
              )}
            </div>

            <Separator />

            {/* Invoice breakdown */}
            <div>
              <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                Invoice breakdown
              </p>
              <dl className="space-y-1.5 text-sm">
                <MoneyRow label="Rental subtotal" amount={booking.subtotal} />
                <MoneyRow
                  label="Delivery & setup"
                  amount={booking.deliveryFee}
                  freeLabel={booking.deliveryFee === 0 ? "Included" : undefined}
                />
                <MoneyRow label="Sales tax (7.375%)" amount={booking.tax} />
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <dt className="font-extrabold">Total</dt>
                  <dd className="font-display text-xl font-black text-primary">
                    {formatMoney(booking.total)}
                  </dd>
                </div>
                <MoneyRow label="Deposit paid (50%)" amount={booking.deposit} />
                <MoneyRow label="Balance due before delivery" amount={booking.balance} bold />
              </dl>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant={booking.status === "sent" ? "secondary" : "default"}>
                {booking.status === "sent" ? "Invoice sent" : "Awaiting invoice"}
              </Badge>
              {booking.status === "sent" && (
                <Button size="sm" variant="outline" onClick={() => onReview(booking)}>
                  <Star className="size-4" /> Leave a review
                </Button>
              )}
              <Button size="sm" variant="ghost" className="ml-auto" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function MoneyRow({
  label,
  amount,
  freeLabel,
  bold,
}: {
  label: string;
  amount: number;
  freeLabel?: string | undefined;
  bold?: boolean | undefined;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-bold" : "font-semibold text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "font-bold" : "font-semibold"}>{freeLabel ?? formatMoney(amount)}</dd>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
      <p className="text-sm font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}
