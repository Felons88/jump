import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHero, CtaBand } from "@/components/site/Shared";
import { serviceCities } from "@/data/site";

export const Route = createFileRoute("/service-areas")({
  head: () => ({
    meta: [
      { title: "Delivery Areas | Bounce House Rentals Near You in Minnesota" },
      {
        name: "description",
        content:
          "Jump City delivers bounce houses and party rentals across Minneapolis, St. Paul, the Twin Cities suburbs, and St. Cloud. See delivery fees by city.",
      },
      { property: "og:title", content: "Jump City Delivery Areas in Minnesota" },
      {
        property: "og:description",
        content: "Free metro delivery over $175. Find your city and delivery minimum.",
      },
    ],
  }),
  component: ServiceAreas,
});

function ServiceAreas() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "fee">("all");

  const filtered = useMemo(
    () =>
      serviceCities.filter((c) => {
        const matches = c.name.toLowerCase().includes(query.trim().toLowerCase());
        const inFilter = filter === "all" || (filter === "free" ? c.free : !c.free);
        return matches && inFilter;
      }),
    [query, filter],
  );

  return (
    <>
      <PageHero
        eyebrow="Service Area"
        title="Where we deliver in Minnesota"
        subtitle="Free delivery on Twin Cities metro orders over $175 and St. Cloud area orders over $300. Outer cities have a subtotal minimum plus a delivery fee."
      />

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your city…"
              aria-label="Search cities"
              className="h-12 rounded-full pl-9 font-semibold"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "free", "fee"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card hover:bg-muted"
                }`}
              >
                {f === "all" ? "All cities" : f === "free" ? "Free delivery" : "Minimum + fee"}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.name} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="flex items-center gap-2 font-display text-lg font-extrabold">
                <MapPin className="size-4 text-secondary" /> {c.name}
              </p>
              <p className={`mt-1 text-sm font-bold ${c.free ? "text-grass" : "text-primary"}`}>
                {c.note}
              </p>
            </li>
          ))}
        </ul>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center font-semibold text-muted-foreground">
            We don't have that city listed — call us and we'll check the route.
          </p>
        ) : null}
      </div>

      <CtaBand
        title="Not sure if we deliver to you?"
        subtitle="Give us a call and we'll confirm your city, fee, and delivery window."
      />
    </>
  );
}
