import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHero, BookingWidgetSlot } from "@/components/site/Shared";
import { EMAIL, PHONE, PHONE_HREF } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Check Your Date | Jump City Inflatable Rentals" },
      {
        name: "description",
        content:
          "Check availability for your Minneapolis or St. Paul event. Call (763) 355-1023, email us, or send a request and we'll confirm your date.",
      },
      { property: "og:title", content: "Check Your Date — Jump City Inflatable Rentals" },
      {
        property: "og:description",
        content: "Tell us your date, city, and event type and we'll confirm availability fast.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Check your date"
        subtitle="Tell us when and where, and we'll confirm what's available. Most requests get a reply the same day."
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[3fr_2fr]">
        <div>
          <BookingWidgetSlot label="Live availability & booking" />

          <form
            className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Request sent! We'll confirm your date shortly.");
            }}
          >
            <h2 className="text-2xl">Send us a request</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Your name" />
              <Field id="phone" label="Phone" type="tel" />
              <Field id="email" label="Email" type="email" />
              <Field id="date" label="Event date" type="date" />
              <Field id="city" label="Delivery city" />
              <Field id="type" label="Event type" placeholder="Birthday, school, church…" />
            </div>
            <div>
              <Label htmlFor="details" className="font-bold">
                What are you looking for?
              </Label>
              <Textarea
                id="details"
                required
                rows={4}
                placeholder="Bounce house for a 6-year-old's birthday, grass backyard, about 20 kids…"
                className="mt-2 font-semibold"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              {sent ? "Request sent" : "Request availability"}
            </Button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-muted/60 p-6">
            <h2 className="text-xl">Reach us directly</h2>
            <ul className="mt-4 space-y-3 text-sm font-bold">
              <li>
                <a href={PHONE_HREF} className="flex items-center gap-2 hover:text-primary">
                  <Phone className="size-4 text-secondary" /> {PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-start gap-2 break-all hover:text-primary"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-secondary" /> {EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-secondary" /> Minneapolis, MN
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-secondary" /> Online booking 24/7
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border shadow-card">
            <iframe
              title="Jump City Inflatable Rentals service area map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-93.55%2C44.79%2C-92.95%2C45.12&layer=mapnik"
              className="h-72 w-full"
              loading="lazy"
            />
          </div>
        </aside>
      </div>
    </>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        required
        placeholder={placeholder}
        className="mt-2 font-semibold"
      />
    </div>
  );
}
