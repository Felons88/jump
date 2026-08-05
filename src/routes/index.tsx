import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  ShieldCheck,
  Sparkles,
  Clock,
  Star,
  CalendarDays,
  MousePointerClick,
  UserRound,
  CreditCard,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CtaBand } from "@/components/site/Shared";
import heroImg from "@/assets/hero-bounce.jpg";
import {
  categories,
  deliveryOptions,
  eventTypes,
  faqs,
  homeCategorySlugs,
  publicEvents,
  serviceCities,
  PHONE,
  PHONE_HREF,
} from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bounce House Rentals Minneapolis | Jump City Inflatable Rentals" },
      {
        name: "description",
        content:
          "Minnesota's trusted bounce house, water slide, and party rentals. Free delivery, setup, and pickup in the Twin Cities metro on orders over $175. Book 24/7.",
      },
      { property: "og:title", content: "Minnesota's Trusted Bounce House & Party Rentals" },
      {
        property: "og:description",
        content:
          "Bounce houses starting at $199. Delivery, setup, and pickup included across Minneapolis, St. Paul, and St. Cloud.",
      },
    ],
  }),
  component: Home,
});

const trustBadges = [
  { icon: Star, label: "15+ Years Experience" },
  { icon: ShieldCheck, label: "Fully Insured" },
  { icon: Sparkles, label: "Cleaned & Sanitized" },
  { icon: Truck, label: "Free Delivery over $175 metro / $300 St. Cloud" },
];

const whyUs = [
  {
    icon: Truck,
    title: "Free delivery & setup",
    body: "Included on Twin Cities metro orders over $175. We handle setup and takedown.",
  },
  {
    icon: Star,
    title: "15+ years in business",
    body: "A family owned Minnesota company that has powered thousands of events.",
  },
  {
    icon: Sparkles,
    title: "Clean & sanitized",
    body: "Commercial-grade vinyl, inspected and sanitized between every single rental.",
  },
  {
    icon: Clock,
    title: "Delivery options",
    body: "Standard, event-day, and 1-hour window delivery to match your schedule.",
  },
  {
    icon: ShieldCheck,
    title: "Highly rated",
    body: "Hundreds of five-star Google reviews from Twin Cities families and schools.",
  },
];

const steps = [
  {
    icon: CalendarDays,
    title: "Pick your date",
    body: "Enter your event date and delivery city to see what's available.",
  },
  {
    icon: MousePointerClick,
    title: "Choose your items",
    body: "Add bounce houses, slides, games, tents, and concessions to your cart.",
  },
  {
    icon: UserRound,
    title: "Enter your info",
    body: "Tell us the address, surface type, and your delivery window.",
  },
  {
    icon: CreditCard,
    title: "Pay deposit or in full",
    body: "50% holds the date, or pay in full. Confirmation lands in your inbox.",
  },
];

const reviews = [
  {
    name: "Sarah M.",
    city: "Maple Grove",
    text: "Delivered the day before, set it up in the rain, and picked up Monday. The kids didn't leave the bounce house for four hours.",
  },
  {
    name: "Pastor Dan R.",
    city: "St. Paul",
    text: "We've used Jump City for VBS three years running. Insurance paperwork was ready before I even asked.",
  },
  {
    name: "Megan T.",
    city: "Eagan",
    text: "The water slide was spotless and the crew was so friendly. Best money I spent on my son's birthday.",
  },
  {
    name: "Chris L.",
    city: "Minneapolis",
    text: "Booked the mechanical bull for our company picnic. Operator was great with the crowd and everything ran on time.",
  },
  {
    name: "Alicia B.",
    city: "Woodbury",
    text: "Easy online booking, clear pricing, no surprises. We'll be back next summer.",
  },
];

function Home() {
  const homeCats = homeCategorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean) as typeof categories;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Kids jumping in a colorful bounce house at a sunny Minnesota backyard party"
          width={1536}
          height={1024}
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{ backgroundImage: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 py-20 text-primary-foreground sm:py-28">
          <p className="font-display text-sm font-extrabold uppercase tracking-widest">
            Minneapolis · St. Paul · St. Cloud
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">
            Minnesota's Trusted Bounce House &amp; Party Rentals
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold opacity-95">
            Delivery, setup, and pickup are included on every rental. Bounce houses starting at
            $199, water slides, obstacle courses, tents, and mechanical rides — clean, sanitized,
            and fully insured.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <Link to="/contact">
                <CalendarDays className="size-5" /> Check Your Date
              </Link>
            </Button>
            <Button asChild variant="onDark" size="xl">
              <Link to="/rentals">Browse Rentals</Link>
            </Button>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 bg-background/95">
          <ul className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map((b) => (
              <li key={b.label} className="flex items-center gap-2 text-sm font-bold">
                <b.icon className="size-5 shrink-0 text-primary" />
                <span className="min-w-0">{b.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why choose */}
      <Section eyebrow="Why Jump City" title="Why Twin Cities families and planners book with us">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {whyUs.map((w) => (
            <div key={w.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="grid size-12 place-items-center rounded-2xl bg-sunshine text-sunshine-foreground">
                <w.icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg">{w.title}</h3>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Shop by category */}
      <Section
        eyebrow="Shop by Category"
        title="Bounce houses, water slides, and everything else"
        subtitle="Browse a category to see individual units, dimensions, and pricing."
        tinted
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeCats.map((c) => (
            <Link
              key={c.slug}
              to="/rentals/$category"
              params={{ category: c.slug }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-pop"
            >
              <img
                src={c.image}
                alt={c.alt}
                loading="lazy"
                width={1024}
                height={768}
                className="h-52 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl">{c.name}</h3>
                <p className="mt-1 text-sm font-bold text-primary">{c.tagline}</p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-muted-foreground">
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Booking steps */}
      <Section
        eyebrow="24/7 Online Booking"
        title="How easy booking works"
        subtitle="Four steps, about a minute, any hour of the day."
      >
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <span className="absolute -top-4 left-6 grid size-9 place-items-center rounded-full bg-primary font-display text-base font-black text-primary-foreground">
                {i + 1}
              </span>
              <s.icon className="mt-3 size-7 text-secondary" />
              <h3 className="mt-3 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Delivery */}
      <Section eyebrow="Delivery" title="Three delivery options" tinted>
        <div className="grid gap-6 md:grid-cols-3">
          {deliveryOptions.map((d) => (
            <div
              key={d.name}
              className={`rounded-3xl border-2 bg-card p-6 shadow-card ${
                d.highlight ? "border-primary" : "border-border"
              }`}
            >
              <h3 className="text-xl">{d.name}</h3>
              <p className="mt-2 font-display text-4xl font-black text-primary">{d.price}</p>
              <p className="text-sm font-bold text-muted-foreground">{d.sub}</p>
              <p className="mt-4 text-sm font-semibold text-muted-foreground">{d.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Events */}
      <Section eyebrow="Events We Serve" title="From field days to city festivals">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {eventTypes.map((e) => (
            <Link
              key={e.slug}
              to="/events/$slug"
              params={{ slug: e.slug }}
              className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:shadow-pop"
            >
              <h3 className="text-lg">{e.name}</h3>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">{e.blurb}</p>
            </Link>
          ))}
          <div className="rounded-2xl border-2 border-grass bg-grass/10 p-5">
            <h3 className="text-lg">Public Events We've Powered</h3>
            <ul className="mt-2 space-y-1 text-sm font-semibold text-muted-foreground">
              {publicEvents.slice(0, 4).map((p) => (
                <li key={p} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-grass" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Service area */}
      <Section
        eyebrow="Service Area"
        title="Serving the Twin Cities metro and St. Cloud"
        subtitle="Free delivery on metro orders over $175. Some outer cities have a subtotal minimum plus a delivery fee."
        tinted
      >
        <ul className="flex flex-wrap gap-2">
          {serviceCities.slice(0, 20).map((c) => (
            <li
              key={c.name}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold"
            >
              <MapPin className="size-4 text-secondary" />
              {c.name}
            </li>
          ))}
        </ul>
        <Button asChild variant="secondary" className="mt-6">
          <Link to="/service-areas">See the full delivery area list</Link>
        </Button>
      </Section>

      {/* Reviews */}
      <Section eyebrow="Reviews" title="What Minnesota families say">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex gap-0.5 text-sunshine">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm font-semibold text-muted-foreground">
                "{r.text}"
              </blockquote>
              <figcaption className="mt-4 font-display font-extrabold">
                {r.name} · <span className="text-muted-foreground">{r.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Questions we get every week" tinted>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(0, 6).map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left font-display text-base font-extrabold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm font-semibold text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link to="/faqs">Read all FAQs</Link>
            </Button>
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-2 font-extrabold text-secondary"
            >
              <Phone className="size-4" /> {PHONE}
            </a>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  tinted,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={tinted ? "bg-muted/50" : undefined}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        {eyebrow ? (
          <p className="font-display text-sm font-extrabold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 max-w-3xl text-3xl sm:text-4xl">{title}</h2>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-base font-semibold text-muted-foreground">{subtitle}</p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
