import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHero, CtaBand } from "@/components/site/Shared";
import { eventTypes, getCategory } from "@/data/site";

export const Route = createFileRoute("/events/$slug")({
  loader: ({ params }) => {
    const event = eventTypes.find((e) => e.slug === params.slug);
    if (!event) throw notFound();
    return { name: event.name, blurb: event.blurb };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Event page not found | Jump City" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} Rentals in the Twin Cities | Jump City`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.blurb },
      ],
    };
  },
  component: EventPage,
});

function EventPage() {
  const { slug } = Route.useParams();
  const event = eventTypes.find((e) => e.slug === slug)!;
  const cats = event.categories.map((c) => getCategory(c)!).filter(Boolean);

  return (
    <>
      <PageHero eyebrow="Events" title={event.name} subtitle={event.blurb} />

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-base font-semibold text-muted-foreground">{event.detail}</p>
            <h2 className="mt-8 text-2xl">Typical use cases</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {event.useCases.map((u) => (
                <li
                  key={u}
                  className="flex items-start gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-bold"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-grass" />
                  {u}
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-3xl border border-border bg-muted/60 p-6">
            <h2 className="text-xl">Popular for this event</h2>
            <div className="mt-4 space-y-4">
              {cats.map((c) => (
                <Link
                  key={c.slug}
                  to="/rentals/$category"
                  params={{ category: c.slug }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card transition hover:-translate-y-0.5"
                >
                  <img
                    src={c.image}
                    alt={c.alt}
                    loading="lazy"
                    width={200}
                    height={150}
                    className="size-16 rounded-xl object-cover"
                  />
                  <span className="font-display font-extrabold">{c.name}</span>
                </Link>
              ))}
            </div>
            <Link
              to="/events"
              className="mt-6 inline-block text-sm font-extrabold text-primary hover:underline"
            >
              ← All event types
            </Link>
          </aside>
        </div>
      </div>

      <CtaBand title={`Book your ${event.name.toLowerCase()}`} />
    </>
  );
}
