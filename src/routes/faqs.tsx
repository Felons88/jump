import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHero, CtaBand } from "@/components/site/Shared";
import { faqs } from "@/data/site";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "Bounce House Rental FAQs | Jump City Minneapolis" },
      {
        name: "description",
        content:
          "Delivery, deposits, weather cancellations, setup surfaces, and space requirements — answers to the questions Twin Cities customers ask most.",
      },
      { property: "og:title", content: "Rental FAQs — Jump City Inflatable Rentals" },
      {
        property: "og:description",
        content: "Everything about deposits, delivery, weather policy, and setup requirements.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Still stuck? Call us — a real person in Minneapolis answers the phone."
      />
      <div className="mx-auto max-w-3xl px-4 py-14">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left font-display text-base font-extrabold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm font-semibold text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <CtaBand />
    </>
  );
}
