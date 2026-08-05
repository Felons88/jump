import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, Ruler, Users, ShieldCheck, Sparkles, Phone, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingFlow } from "@/components/site/BookingFlow";
import { CtaBand } from "@/components/site/Shared";
import { ImageWithSkeleton } from "@/components/site/ImageWithSkeleton";
import { getCategory, PHONE, PHONE_HREF } from "@/data/site";
import { useCart } from "@/data/cart";

export const Route = createFileRoute("/rentals/$category/$item")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    const item = category?.items.find((i) => i.slug === params.item);
    if (!category || !item) throw notFound();
    return { name: item.name, blurb: item.blurb, category: category.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Rental not found | Jump City" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} Rental | Jump City Minneapolis`;
    const description = `${loaderData.blurb} Rent the ${loaderData.name} in the Twin Cities — delivery, setup, and pickup included.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { category: catSlug, item: itemSlug } = Route.useParams();
  const category = getCategory(catSlug)!;
  const item = category.items.find((i) => i.slug === itemSlug)!;
  const gallery = item.gallery?.length ? item.gallery : [item.image, category.image];
  const [active, setActive] = useState(0);
  const { addItem, lines, eventDate } = useCart();
  const inCart = lines.some((l) => l.item.slug === item.slug);

  const related = category.items.filter((i) => i.slug !== item.slug).slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm font-bold text-muted-foreground">
          <Link to="/rentals" className="hover:text-primary">
            Rentals
          </Link>
          {" / "}
          <Link
            to="/rentals/$category"
            params={{ category: category.slug }}
            className="hover:text-primary"
          >
            {category.name}
          </Link>
        </p>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <ImageWithSkeleton
              src={gallery[active] ?? item.image}
              alt={active === 0 ? item.alt : `${item.name} — additional photo ${active + 1}`}
              wrapperClass="h-72 w-full rounded-3xl shadow-pop sm:h-96"
              priority
            />
            <div className="mt-3 flex gap-3">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View photo ${i + 1}`}
                  className={`overflow-hidden rounded-xl border-2 ${
                    active === i ? "border-primary" : "border-border"
                  }`}
                >
                  <img
                    src={g}
                    alt=""
                    loading="lazy"
                    width={120}
                    height={90}
                    className="h-16 w-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl">{item.name}</h1>
            <p className="mt-3 text-base font-semibold text-muted-foreground">{item.blurb}</p>
            <p className="mt-5 font-display text-4xl font-black text-primary">
              From ${item.priceFrom}
            </p>
            <p className="text-sm font-bold text-muted-foreground">
              Per-day rental · delivery, setup, and takedown included
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <dt className="flex items-center gap-2 text-sm font-extrabold">
                  <Ruler className="size-4 text-secondary" /> Space required
                </dt>
                <dd className="mt-1 text-sm font-semibold text-muted-foreground">
                  {item.dimensions} — add 5 ft clearance on all sides
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <dt className="flex items-center gap-2 text-sm font-extrabold">
                  <Users className="size-4 text-secondary" /> Age range
                </dt>
                <dd className="mt-1 text-sm font-semibold text-muted-foreground">{item.ages}</dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-2 text-sm font-bold">
              <li className="flex items-center gap-2">
                <Truck className="size-4 text-primary" /> Delivery, setup, and pickup included
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Cleaned and sanitized before every
                rental
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Commercial-grade vinyl · fully
                insured
              </li>
            </ul>

            <div className="mt-7">
              <BookingFlow item={item} category={category} />
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
              <p className="text-sm font-bold">
                {eventDate
                  ? `Adding to your party on ${new Date(eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                  : "Pick a date on the rentals page first, then add items to your party."}
              </p>
              <Button
                className="mt-3 w-full"
                variant={inCart ? "outline" : "secondary"}
                disabled={!eventDate}
                onClick={() => addItem(item, category)}
              >
                {inCart ? (
                  <>
                    <Check className="size-4" /> Added — add another
                  </>
                ) : (
                  <>
                    <Plus className="size-4" /> Add to party
                  </>
                )}
              </Button>
              {!eventDate && (
                <Button asChild variant="link" size="sm" className="mt-1 w-full">
                  <Link to="/rentals">Go pick a date</Link>
                </Button>
              )}
            </div>

            <a
              href={PHONE_HREF}
              className="mt-4 inline-flex items-center gap-2 font-extrabold text-secondary"
            >
              <Phone className="size-4" /> Questions? Call {PHONE}
            </a>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-2xl">More {category.name.toLowerCase()}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Link
                  key={r.slug}
                  to="/rentals/$category/$item"
                  params={{ category: category.slug, item: r.slug }}
                  className="overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-pop"
                >
                  <ImageWithSkeleton
                    src={r.image}
                    alt={r.alt}
                    wrapperClass="aspect-[4/3] w-full"
                    priority={i < 3}
                  />
                  <div className="p-4">
                    <h3 className="text-lg">{r.name}</h3>
                    <p className="mt-1 font-display text-xl font-black text-primary">
                      From ${r.priceFrom}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <CtaBand />
    </>
  );
}
