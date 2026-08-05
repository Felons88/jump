import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Truck, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/site/Shared";
import { ImageWithSkeleton } from "@/components/site/ImageWithSkeleton";
import { getCategory, type RentalItem } from "@/data/site";

export const Route = createFileRoute("/rentals/$category/")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    return { name: category.name, description: category.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Rental not found | Jump City" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} Rentals in Minneapolis | Jump City`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
      ],
    };
  },
  component: CategoryPage,
});

function ProductCard({
  item,
  categorySlug,
  index,
}: {
  item: RentalItem;
  categorySlug: string;
  index: number;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <Link
        to="/rentals/$category/$item"
        params={{ category: categorySlug, item: item.slug }}
        className="relative block"
      >
        <ImageWithSkeleton
          src={item.image}
          alt={item.alt}
          wrapperClass="aspect-[4/3] w-full"
          priority={index < 3}
        />
        <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-sm font-extrabold text-white">View Details</span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-lg font-extrabold">
          <Link
            to="/rentals/$category/$item"
            params={{ category: categorySlug, item: item.slug }}
            className="hover:text-primary"
          >
            {item.name}
          </Link>
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {item.dimensions} · {item.ages}
        </p>
        <p className="mt-3 font-display text-2xl font-black text-primary">From ${item.priceFrom}</p>
        <Button asChild className="mt-4 w-full">
          <Link to="/rentals/$category/$item" params={{ category: categorySlug, item: item.slug }}>
            Check Availability
          </Link>
        </Button>
      </div>
    </article>
  );
}

function CategoryPage() {
  const { category: slug } = Route.useParams();
  const category = getCategory(slug)!;

  return (
    <>
      <section className="border-b border-border bg-muted/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Link to="/rentals" className="text-sm font-extrabold text-primary hover:underline">
              ← All rentals
            </Link>
            <h1 className="mt-3 text-3xl sm:text-5xl">{category.name}</h1>
            <p className="mt-4 text-base font-semibold text-muted-foreground sm:text-lg">
              {category.description}
            </p>
            <ul className="mt-5 flex flex-wrap gap-4 text-sm font-bold">
              <li className="flex items-center gap-2">
                <Truck className="size-4 text-primary" /> Delivery &amp; setup included
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Cleaned &amp; sanitized
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Fully insured
              </li>
            </ul>
          </div>
          <ImageWithSkeleton
            src={category.image}
            alt={category.alt}
            wrapperClass="h-64 w-full rounded-3xl shadow-pop lg:h-80"
            priority
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((item, i) => (
            <ProductCard key={item.slug} item={item} categorySlug={category.slug} index={i} />
          ))}
        </div>
      </div>

      <CtaBand title={`Book your ${category.name.toLowerCase()} today`} />
    </>
  );
}
