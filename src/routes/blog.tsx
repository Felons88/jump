import { createFileRoute } from "@tanstack/react-router";
import { PageHero, CtaBand } from "@/components/site/Shared";
import { blogPosts } from "@/data/site";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Media Room | Jump City Inflatable Rentals" },
      {
        name: "description",
        content:
          "Party planning tips, Minnesota event guides, and press resources from Jump City Inflatable Rentals in Minneapolis.",
      },
      { property: "og:title", content: "Jump City Blog & Media Room" },
      {
        property: "og:description",
        content: "Planning guides for Twin Cities parties, school events, and city festivals.",
      },
    ],
  }),
  component: Blog,
});

function Blog() {
  return (
    <>
      <PageHero
        eyebrow="Blog & Media Room"
        title="Party planning notes from the Twin Cities"
        subtitle="Guides, checklists, and press resources. For media inquiries, email sales@jumpcityinflatablerentals.com."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((p) => (
          <article
            key={p.slug}
            className="rounded-3xl border border-border bg-card p-6 shadow-card"
          >
            <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
              {p.date}
            </p>
            <h2 className="mt-2 text-xl">{p.title}</h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{p.excerpt}</p>
          </article>
        ))}
      </div>
      <CtaBand />
    </>
  );
}
