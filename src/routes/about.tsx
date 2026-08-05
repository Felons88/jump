import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, Heart, Truck } from "lucide-react";
import { PageHero, CtaBand } from "@/components/site/Shared";
import heroImg from "@/assets/hero-bounce.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Jump City | Family Owned Party Rentals in Minneapolis" },
      {
        name: "description",
        content:
          "Jump City Inflatable Rentals is a family owned Minnesota company with 15+ years delivering clean, safe, fully insured inflatables across the Twin Cities.",
      },
      { property: "og:title", content: "Family Owned Minnesota Party Rentals Since Day One" },
      {
        property: "og:description",
        content: "15+ years, fully insured, commercial-grade equipment, and a crew that shows up.",
      },
    ],
  }),
  component: About,
});

const pillars = [
  {
    icon: Heart,
    title: "Family owned and operated",
    body: "We started with one bounce house and a trailer. Today our family still answers the phone and loads the truck.",
  },
  {
    icon: ShieldCheck,
    title: "Safety and insurance first",
    body: "Fully insured with certificates available for schools, churches, cities, and venues. Every unit is anchored to spec.",
  },
  {
    icon: Sparkles,
    title: "Genuinely clean equipment",
    body: "Commercial-grade vinyl, inspected and sanitized between every rental. If it isn't clean, it doesn't leave the shop.",
  },
  {
    icon: Truck,
    title: "We handle the heavy part",
    body: "Delivery, setup, takedown, and pickup are included so you can host, not haul.",
  },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="15+ years of Minnesota parties"
        subtitle="Jump City Inflatable Rentals is a family owned party and event rental company serving the Minneapolis/St. Paul metro and St. Cloud."
      />

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <img
            src={heroImg}
            alt="A Jump City bounce house set up in a Minnesota backyard"
            loading="lazy"
            width={1536}
            height={1024}
            className="h-72 w-full rounded-3xl object-cover shadow-pop sm:h-96"
          />
          <div className="space-y-4 text-base font-semibold text-muted-foreground">
            <p>
              We've spent more than fifteen years in the inflatable rental industry, and in that
              time we've learned that the equipment is only half the job. The other half is showing
              up on time, setting up safely, and leaving a yard cleaner than we found it.
            </p>
            <p>
              Today we deliver bounce houses, water slides, obstacle courses, tents, mechanical
              rides, and event games to backyards, school fields, church parking lots, and city
              parks all over Minnesota — from Minneapolis and St. Paul out to St. Cloud.
            </p>
            <p>
              Every rental includes delivery, setup, and pickup, and every unit is commercial-grade
              vinyl that's cleaned and sanitized between rentals. We're fully insured and happy to
              provide a certificate for your school, church, or city.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid size-12 place-items-center rounded-2xl bg-sunshine text-sunshine-foreground">
                <p.icon className="size-6" />
              </span>
              <h2 className="mt-4 text-lg">{p.title}</h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      <CtaBand />
    </>
  );
}
