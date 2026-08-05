import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHero, CtaBand } from "@/components/site/Shared";
import { eventTypes, publicEvents } from "@/data/site";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "School, Church & Corporate Event Rentals | Jump City Minnesota" },
      {
        name: "description",
        content:
          "Jump City powers school field days, church festivals, corporate picnics, and Minnesota city events with inflatables, games, and tents.",
      },
      { property: "og:title", content: "Events We Serve Across Minnesota" },
      {
        property: "og:description",
        content: "School, church, corporate, and city event rentals with full delivery and setup.",
      },
    ],
  }),
  component: EventsHub,
});

function EventsHub() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Events we serve across Minnesota"
        subtitle="From a 30-kid field day in Edina to a 5,000-guest city festival, we scale the fun and handle the logistics."
      />

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {eventTypes.map((e) => (
            <Link
              key={e.slug}
              to="/events/$slug"
              params={{ slug: e.slug }}
              className="rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-pop"
            >
              <h2 className="text-2xl">{e.name}</h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">{e.blurb}</p>
              <p className="mt-4 text-sm font-extrabold text-primary">Learn more →</p>
            </Link>
          ))}
        </div>

        <section className="mt-14 rounded-3xl border-2 border-grass bg-grass/10 p-8">
          <h2 className="text-2xl">Public events we've powered</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {publicEvents.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm font-bold">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-grass" />
                {p}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <CtaBand title="Planning an event? Let's talk logistics." />
    </>
  );
}
