import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PHONE, PHONE_HREF } from "@/data/site";

export function CtaBand({
  title = "Ready to book your event?",
  subtitle = "Check your date in under a minute. Delivery, setup, and pickup are always included.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="gradient-band text-primary-foreground">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base font-semibold opacity-95">{subtitle}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="hero" size="xl">
            <Link to="/contact">Check Availability</Link>
          </Button>
          <Button asChild variant="onDark" size="xl">
            <a href={PHONE_HREF}>
              <Phone className="size-5" /> {PHONE}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-border bg-muted/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {eyebrow ? (
          <p className="font-display text-sm font-extrabold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-3xl text-3xl sm:text-5xl">{title}</h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-base font-semibold text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Slot for the external "Inflatable Office" booking widget / cart embed.
 * Drop the provider script or iframe inside this component when it's ready.
 */
export function BookingWidgetSlot({ label = "Booking widget" }: { label?: string }) {
  return (
    <div
      data-booking-widget-slot
      className="rounded-2xl border-2 border-dashed border-accent bg-accent/10 p-6 text-center"
    >
      <p className="font-display text-lg font-extrabold">{label}</p>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">
        Inflatable Office availability &amp; cart embed goes here.
      </p>
      <Button asChild className="mt-4">
        <Link to="/contact">Check Your Date</Link>
      </Button>
    </div>
  );
}
