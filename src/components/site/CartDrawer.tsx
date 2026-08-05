import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/data/cart";
import { formatMoney } from "@/data/mockBookings";
import { format } from "date-fns";

export function CartDrawer() {
  const {
    lines,
    subtotal,
    itemCount,
    eventDate,
    pickupDate,
    rentalDays,
    removeLine,
    updateQuantity,
    clear,
  } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition hover:bg-muted"
          aria-label={`Party cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        >
          <ShoppingCart className="size-5" />
          <span className="hidden sm:inline">Party</span>
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
              {itemCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[92vw] overflow-y-auto sm:w-96">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Your Party Cart</SheetTitle>
        </SheetHeader>

        {eventDate && (
          <div className="mt-2 rounded-lg border border-border bg-muted/40 p-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              Delivery
            </p>
            <p className="text-sm font-bold text-primary">
              {format(eventDate, "EEE, MMM d, yyyy")}
            </p>
            {pickupDate && (
              <>
                <p className="mt-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                  Pickup
                </p>
                <p className="text-sm font-bold text-primary">
                  {format(pickupDate, "EEE, MMM d, yyyy")}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {rentalDays} rental day{rentalDays === 1 ? "" : "s"}
                </p>
              </>
            )}
          </div>
        )}

        {lines.length === 0 ? (
          <div className="mt-8 text-center">
            <ShoppingCart className="mx-auto size-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              Your cart is empty. Pick a date and add items to your party!
            </p>
            <Button asChild className="mt-4">
              <Link to="/rentals">Browse rentals</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {lines.map((line) => (
                <div
                  key={line.item.slug}
                  className="flex gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <img
                    src={line.item.image}
                    alt={line.item.alt}
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-extrabold leading-tight">{line.item.name}</p>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {line.categoryName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeLine(line.item.slug)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${line.item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(line.item.slug, line.quantity - 1)}
                          className="flex size-6 items-center justify-center rounded-md border border-border hover:bg-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.item.slug, line.quantity + 1)}
                          className="flex size-6 items-center justify-center rounded-md border border-border hover:bg-muted"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <span className="font-display text-sm font-black text-primary">
                        {formatMoney(line.item.priceFrom * line.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3 rounded-xl bg-muted/50 p-4">
              <div className="flex justify-between text-sm font-bold">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                Delivery fee & tax calculated at checkout.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link to="/checkout">Continue to checkout</Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => clear()}>
                <X className="size-4" /> Clear cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
