import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Shared";
import { PHONE } from "@/data/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Rental Terms & Agreement | Jump City Inflatable Rentals" },
      {
        name: "description",
        content:
          "Deposit, cancellation, weather, setup surface, and supervision terms for Jump City inflatable rentals in Minnesota.",
      },
      { property: "og:title", content: "Rental Terms — Jump City Inflatable Rentals" },
      {
        property: "og:description",
        content: "Deposits, weather policy, setup requirements, and safety rules.",
      },
    ],
  }),
  component: Terms,
});

const sections = [
  {
    title: "Deposits and payment",
    body: "A 50% deposit reserves your date. The remaining balance is due before setup, or you may pay in full at online checkout.",
  },
  {
    title: "Cancellations and weather",
    body: "Cancel or reschedule with at least 24 hours' notice at no charge. If sustained winds exceed 20 mph or severe weather is forecast, we will contact you to reschedule and no penalty applies.",
  },
  {
    title: "Setup surfaces and space",
    body: "Grass is preferred. We can also set up on asphalt, concrete, or indoor floors with sandbags. We cannot set up on sand, gravel, or rocky ground. Units must be at least 20 feet from power lines with 5 feet of clearance on all sides and a clear 3-foot path to the setup area.",
  },
  {
    title: "Supervision and safety",
    body: "An adult must supervise the inflatable at all times. No shoes, glasses, food, drink, silly string, or sharp objects inside. Riders should be grouped by similar size, and units must be evacuated if blowers stop or weather turns.",
  },
  {
    title: "Insurance",
    body: "Jump City is fully insured. Certificates of insurance are available on request for schools, churches, cities, and venues.",
  },
];

function Terms() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Rental terms & agreement" />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-14 text-sm font-semibold text-muted-foreground">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl text-foreground">{s.title}</h2>
            <p className="mt-2">{s.body}</p>
          </section>
        ))}
        <p>Questions about these terms? Call us at {PHONE}.</p>
      </div>
    </>
  );
}
