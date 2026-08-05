import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Shared";
import { EMAIL, PHONE } from "@/data/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Jump City Inflatable Rentals" },
      {
        name: "description",
        content:
          "How Jump City Inflatable Rentals collects, uses, and protects customer information for bookings in Minnesota.",
      },
      { property: "og:title", content: "Privacy Policy — Jump City Inflatable Rentals" },
      {
        property: "og:description",
        content: "Our approach to customer data and booking information.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-14 text-sm font-semibold text-muted-foreground">
        <p>
          This page is maintained by Jump City Inflatable Rentals to explain how we handle
          information collected through this website and our booking process.
        </p>
        <Block title="Information we collect">
          When you request availability or place a booking, we collect the name, phone number, email
          address, delivery address, and event details you provide. Payment information is handled
          by our booking and payment providers; we do not store full card numbers.
        </Block>
        <Block title="How we use it">
          We use your information to confirm availability, schedule delivery, contact you about your
          event, and follow up after your rental. We do not sell customer information.
        </Block>
        <Block title="Cookies and analytics">
          This site may use cookies and standard web analytics to understand traffic and improve the
          booking experience. You can disable cookies in your browser settings.
        </Block>
        <Block title="Your choices">
          You can request a copy or deletion of the information we hold about you by emailing{" "}
          {EMAIL} or calling {PHONE}.
        </Block>
      </div>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl text-foreground">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
