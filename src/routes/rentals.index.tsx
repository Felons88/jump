import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  Plus,
  RotateCcw,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { PageHero, CtaBand } from "@/components/site/Shared";
import { ImageWithSkeleton } from "@/components/site/ImageWithSkeleton";
import { CartDrawer } from "@/components/site/CartDrawer";
import { categories, homeCategorySlugs, type Category, type RentalItem } from "@/data/site";
import { useCart } from "@/data/cart";
import { isItemAvailableForRange, rentalDayCount } from "@/lib/availability";
import { formatMoney } from "@/data/mockBookings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rentals/")({
  head: () => ({
    meta: [
      { title: "Party & Inflatable Rentals in Minneapolis | Jump City" },
      {
        name: "description",
        content:
          "Browse Jump City rental categories: bounce houses, water slides, obstacle courses, tents, concessions, mechanical rides, and entertainers in the Twin Cities.",
      },
      { property: "og:title", content: "Browse All Rentals — Jump City Inflatable Rentals" },
      {
        property: "og:description",
        content: "Every inflatable and party rental category we deliver across Minnesota.",
      },
    ],
  }),
  component: RentalsIndex,
});

/** All items across all categories, flattened. */
function allItems(): { item: RentalItem; category: Category }[] {
  const out: { item: RentalItem; category: Category }[] = [];
  for (const cat of categories) {
    for (const item of cat.items) {
      out.push({ item, category: cat });
    }
  }
  return out;
}

function RentalsIndex() {
  const { eventDate, pickupDate, setDateRange, addItem, lines } = useCart();
  const [range, setRange] = useState<DateRange | undefined>(
    eventDate ? { from: eventDate, to: pickupDate } : undefined,
  );
  const [confirmed, setConfirmed] = useState(Boolean(eventDate));
  const resultsRef = useRef<HTMLElement>(null);

  const items = useMemo(() => allItems(), []);

  const deliveryDate = range?.from;
  const returnDate = range?.to;
  const hasFullRange = Boolean(deliveryDate && returnDate);

  /** Only items free for the whole delivery→pickup window. Booked items are hidden from customers. */
  const availableItems = useMemo(() => {
    if (!deliveryDate) return items;
    return items.filter(({ item }) => isItemAvailableForRange(item, deliveryDate, returnDate));
  }, [items, deliveryDate, returnDate]);

  const days = deliveryDate ? rentalDayCount(deliveryDate, returnDate) : 0;

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleConfirm = (overrideRange?: DateRange) => {
    const from = overrideRange?.from ?? range?.from;
    const to = overrideRange?.to ?? range?.to;
    if (!from) return;
    setDateRange(from, to);
    setRange({ from, to });
    setConfirmed(true);
  };

  const handleReset = () => {
    setRange(undefined);
    setConfirmed(false);
    setDateRange(undefined, undefined);
  };

  /** Auto-scroll to the available items once both dates are locked in. */
  useEffect(() => {
    if (confirmed && hasFullRange) {
      const t = window.setTimeout(scrollToResults, 150);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [confirmed, hasFullRange, scrollToResults]);

  return (
    <>
      <PageHero
        eyebrow="Rentals"
        title="Pick your dates, build your party"
        subtitle="Choose your delivery and pickup dates first, then add any items you want — bounce houses, slides, concessions, all in one booking. Delivery, setup, and pickup included."
      />

      {/* Booking.com-style date range selector */}
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <DateRangePicker
            range={range}
            onRangeChange={setRange}
            onConfirm={handleConfirm}
            onReset={handleReset}
            confirmed={confirmed}
            availableCount={availableItems.length}
            days={days}
          />
        </div>
      </section>

      {/* Available items grid */}
      <section ref={resultsRef} className="mx-auto max-w-7xl px-4 py-12 scroll-mt-20">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold">
              {deliveryDate ? "Available for your dates" : "All rentals"}
            </h2>
            {deliveryDate && (
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {format(deliveryDate, "MMM d")}
                {returnDate
                  ? ` – ${format(returnDate, "MMM d, yyyy")}`
                  : ", " + format(deliveryDate, "yyyy")}
                {" · "}
                {availableItems.length} item{availableItems.length === 1 ? "" : "s"} ready to book
              </p>
            )}
          </div>
          <CartDrawer />
        </div>

        {!deliveryDate ? (
          /* Category cards when no dates are picked yet */
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {homeCategorySlugs
              .map((slug) => categories.find((c) => c.slug === slug))
              .filter((c): c is Category => Boolean(c))
              .map((c, i) => (
                <CategoryCard key={c.slug} category={c} index={i} />
              ))}
          </div>
        ) : availableItems.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <p className="text-lg font-extrabold text-muted-foreground">
              Nothing available for those dates
            </p>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Try a different date range — our inventory rotates quickly.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleReset}>
              <RotateCcw className="size-4" /> Pick new dates
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {availableItems.map(({ item, category }, i) => (
              <AvailableItemCard
                key={item.slug}
                item={item}
                category={category}
                index={i}
                inCart={lines.some((l) => l.item.slug === item.slug)}
                onAdd={() => addItem(item, category)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Sticky cart bar */}
      {lines.length > 0 && <StickyCartBar />}

      <CtaBand />
    </>
  );
}

/**
 * Booking.com-style two-field date selector. Shows Delivery / Pickup as
 * adjacent panels with a shared two-month range calendar underneath.
 */
function DateRangePicker({
  range,
  onRangeChange,
  onConfirm,
  onReset,
  confirmed,
  availableCount,
  days,
}: {
  range: DateRange | undefined;
  onRangeChange: (r: DateRange | undefined) => void;
  onConfirm: (overrideRange?: DateRange) => void;
  onReset: () => void;
  confirmed: boolean;
  availableCount: number;
  days: number;
}) {
  const today = startOfDay(new Date());
  const from = range?.from;
  const to = range?.to;
  const complete = Boolean(from && to);

  const applyPreset = (offset: number, nights: number) => {
    const start = addDays(today, offset);
    const end = addDays(start, nights);
    const presetRange = { from: start, to: end };
    onRangeChange(presetRange);
    onConfirm(presetRange);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      {/* Field row */}
      <div className="grid divide-y divide-border sm:grid-cols-[1fr_1fr_auto] sm:divide-x sm:divide-y-0">
        <DateField
          icon={<Truck className="size-4" />}
          label="Delivery date"
          value={from ? format(from, "EEE, MMM d, yyyy") : "Select a date"}
          active={!from}
          filled={Boolean(from)}
        />
        <DateField
          icon={<RotateCcw className="size-4" />}
          label="Pickup date"
          value={to ? format(to, "EEE, MMM d, yyyy") : from ? "Select a date" : "—"}
          active={Boolean(from) && !to}
          filled={Boolean(to)}
        />
        <div className="flex items-center justify-center gap-2 p-4">
          {complete ? (
            <>
              <Button
                size="lg"
                onClick={() => onConfirm()}
                variant={confirmed ? "outline" : "default"}
              >
                {confirmed ? (
                  <>
                    <Check className="size-4" /> Dates set
                  </>
                ) : (
                  <>
                    See availability <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
              <Button size="lg" variant="ghost" onClick={onReset} aria-label="Reset dates">
                <RotateCcw className="size-4" />
              </Button>
            </>
          ) : (
            <p className="text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {from ? "Now pick a pickup date" : "Start with your delivery date"}
            </p>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="border-t border-border bg-muted/20 p-4">
        <div className="flex justify-center">
          <Calendar
            mode="range"
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={2}
            defaultMonth={from ?? today}
            disabled={[{ before: today }]}
            className="[--cell-size:2.35rem]"
          />
        </div>

        {/* Summary strip */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-3">
          {complete ? (
            <>
              <Badge className="gap-1">
                <CalendarIcon className="size-3" /> {days} rental day{days === 1 ? "" : "s"}
              </Badge>
              <Badge variant="secondary">
                {availableCount} item{availableCount === 1 ? "" : "s"} available
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground">
                Delivery & pickup are included in every rental.
              </span>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Quick pick:
              </span>
              {[
                { label: "This weekend", offset: nextSaturdayOffset(today), nights: 1 },
                { label: "Single day", offset: 7, nights: 0 },
                { label: "Full weekend", offset: nextSaturdayOffset(today), nights: 2 },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset(preset.offset, preset.nights)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DateField({
  icon,
  label,
  value,
  active,
  filled,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  active: boolean;
  filled: boolean;
}) {
  return (
    <div
      className={cn(
        "p-4 transition-colors",
        active && "bg-primary/5 ring-1 ring-inset ring-primary/30",
      )}
    >
      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
        <span className={cn(active ? "text-primary" : "text-muted-foreground")}>{icon}</span>
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-lg font-black leading-tight",
          filled ? "text-foreground" : "text-muted-foreground/50",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Days until the next Saturday (used by the quick-pick presets). */
function nextSaturdayOffset(today: Date): number {
  const day = today.getDay();
  const diff = (6 - day + 7) % 7;
  return diff === 0 ? 7 : diff;
}

function CategoryCard({ category: c, index }: { category: Category; index: number }) {
  const startingAt = Math.min(...c.items.map((i) => i.priceFrom));

  return (
    <Link
      to="/rentals/$category"
      params={{ category: c.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-pop"
    >
      <div className="relative">
        <ImageWithSkeleton
          src={c.image}
          alt={c.alt}
          wrapperClass="aspect-[4/3] w-full"
          priority={index < 4}
        />
        <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-sm font-extrabold text-white">View category</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-lg font-extrabold">{c.name}</h2>
        <p className="mt-0.5 text-sm font-bold text-primary">{c.tagline}</p>
        <p className="mt-auto pt-2 text-sm font-semibold text-muted-foreground">
          Starting at ${startingAt}
        </p>
      </div>
    </Link>
  );
}

function AvailableItemCard({
  item,
  category,
  index,
  inCart,
  onAdd,
}: {
  item: RentalItem;
  category: Category;
  index: number;
  inCart: boolean;
  onAdd: () => void;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <Link
        to="/rentals/$category/$item"
        params={{ category: category.slug, item: item.slug }}
        className="relative block"
      >
        <ImageWithSkeleton
          src={item.image}
          alt={item.alt}
          wrapperClass="aspect-[4/3] w-full"
          priority={index < 8}
        />
        <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-sm font-extrabold text-white">View details</span>
        </div>
        {inCart && (
          <div className="absolute right-2 top-2">
            <Badge className="bg-primary text-primary-foreground">
              <Check className="mr-1 size-3" /> In cart
            </Badge>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-extrabold leading-tight">
          <Link
            to="/rentals/$category/$item"
            params={{ category: category.slug, item: item.slug }}
            className="hover:text-primary"
          >
            {item.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          {item.dimensions} · {item.ages}
        </p>
        <p className="mt-2 font-display text-xl font-black text-primary">From ${item.priceFrom}</p>
        <Button
          className={cn(
            "mt-3 w-full",
            inCart && "border-primary bg-primary/10 text-primary hover:bg-primary/20",
          )}
          variant={inCart ? "outline" : "default"}
          size="sm"
          onClick={onAdd}
        >
          <Plus className="size-4" /> {inCart ? "Add another" : "Add to party"}
        </Button>
      </div>
    </article>
  );
}

function StickyCartBar() {
  const { lines, subtotal, itemCount, eventDate, pickupDate } = useCart();

  return (
    <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <ShoppingCart className="size-5 text-primary" />
          <span>
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
          {eventDate && (
            <span className="hidden text-muted-foreground md:inline">
              · {format(eventDate, "MMM d")}
              {pickupDate ? ` – ${format(pickupDate, "MMM d")}` : ""}
            </span>
          )}
          <span className="hidden text-muted-foreground lg:inline">
            · {lines.map((l) => l.item.name).join(", ")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-black text-primary">
            {formatMoney(subtotal)}
          </span>
          <Button asChild size="sm">
            <Link to="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
