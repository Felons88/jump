# Jump City Bounce Redesign

# Lovable Prompt — Jump City Inflatable Rentals Website Redesign

Copy everything below into Lovable as your starting prompt.

---

Build a modern, high-converting marketing website for **Jump City Inflatable Rentals**, a family-owned party and event rental company in the Minneapolis/St. Paul metro area (also serving St. Cloud). They rent bounce houses, water slides, obstacle courses, tents, mechanical rides, and event games, with full-service delivery, setup, and pickup.

## Vibe / Design Direction

- Fun, energetic, and colorful — this is a bounce house company, not a law firm. Think bold primary colors (reds, yellows, blues, teal), playful rounded shapes/typography for headings, but keep it clean and professional enough that parents and school/corporate event planners trust it with a deposit.
- Mobile-first: most visitors are searching on their phone ("bounce house rental near me") and want to check a date fast.
- Fast, uncluttered hero section with an obvious primary action: check availability / browse rentals.
- Avoid generic stock-photo feel — use large, bright product-style imagery placeholders for bounce houses, water slides, tents.

## Global Elements

- Sticky header: logo, nav (Rentals ▾, Events ▾, Service Areas, About ▾, Contact), phone number (763) 355-1023 click-to-call, and a prominent "Check Your Date" / "Book Now" button.
- Rentals dropdown categories: Bounce Houses, Bounce House with Slide, Toddler Inflatables, Dry Slides, Water Slides, Water Slide Bounce Houses, Foam Parties, Obstacle Courses, Interactive Games, Golf Games, Mechanical Rides, Concessions, Tents, Event Entertainers.
- Events dropdown: School Events, Church Events, Corporate Events, City Events & Festivals, Public Events We've Powered.
- Footer: contact info (Minneapolis, MN / (763) 355-1023 / sales@jumpcityinflatablerentals.com), social links (Facebook, Instagram, YouTube, Yelp, LinkedIn), quick links (Blog, FAQs, Privacy Policy, Terms, Delivery Areas, Media Room), and a short list of top service-area cities linking to a full locations page.
- Trust badges visible near the top: "15+ Years Experience," "Fully Insured," "Cleaned & Sanitized," "Free Delivery over $175 (metro) / $300 (St. Cloud area)."

## Homepage Sections (in order)

1. **Hero** — Headline: something like "Minnesota's Trusted Bounce House & Party Rentals." Subhead about delivery, setup, and pickup included. Primary CTA: "Check Your Date" (date picker feel), secondary CTA: "Browse Rentals." Background: bright inflatable imagery.
2. **Why Choose Jump City** — icon row: Free delivery/setup in Twin Cities metro, 15+ years experience, clean & sanitized equipment, multiple delivery options, highly rated on Google.
3. **Shop by Category** — visual card grid: Bounce Houses, Water Slides, Combo Bounce Houses, Obstacle Courses, Interactive Games, Tents, Concessions, Event Entertainers, Mechanical Rides/Extreme Attractions (mechanical bull, rock climbing wall). Each card links to its category page.
4. **How Easy Booking Works** — 4-step visual: Pick your date → Choose your item(s) → Enter info → Pay deposit or in full. Reinforce "24/7 Online Booking."
5. **Delivery Options** — 3-card comparison: Standard Delivery (Free, delivered 12–48 hrs ahead), Event Day Delivery ($49, as early as 11am), Expedited/1-hr Window Delivery ($79, required for park deliveries).
6. **Events We Serve** — cards for School Events, Church Events, Corporate Events, City Events & Festivals, with a "Public Events We've Powered" trust card (Boom Island, Andover, etc.).
7. **Service Area** — map or grid of served cities (Minneapolis, St. Paul, Bloomington, Minnetonka, Maple Grove, Woodbury, Eagan, Edina, Plymouth, and more), with a note that some outer cities have a subtotal minimum + delivery fee, and a link to the full delivery-area list.
8. **Testimonials / Google Reviews** — placeholder for 3–5 review cards.
9. **FAQ accordion** — pull from: Does price include delivery/setup? Cancellation policy (weather/wind over 20mph, 24-hr notice)? Deposit required (50%)? What surfaces can you set up on (grass preferred, no sand/rocks)? Extended rental discounts? Will it fit my backyard (20ft from power lines)?
10. **Final CTA band** — "Ready to book your event?" with Check Availability button and phone number.

## Other Key Pages

- **Category/Rental listing pages** (e.g. Bounce Houses, Water Slides) — grid of individual rental items with photo, name, price-from, "Check Availability" button.
- **Individual product page** — large photo gallery, dimensions/space required, age range, price, what's included (delivery/setup/takedown), "Add to Cart"/"Check Date" CTA.
- **Events hub page** + sub-pages for School/Church/Corporate/City events — each explains typical use cases and links back to relevant rental categories.
- **Service area / Locations page** — searchable/filterable list of all cities with delivery fee notes (Free vs. subtotal minimum + fee).
- **About Us** — family-owned story, 15+ years in business, safety/insurance commitment.
- **Contact page** — form + phone + email + address, embedded map.
- **FAQ page** — fuller version of homepage FAQ.
- **Blog / Media Room** — simple list/grid template.

## Content & Copy Notes

- Emphasize throughout: "delivery, setup, and pickup included," "clean and sanitized between every rental," "commercial-grade vinyl," "fully insured," "family owned and operated," "15+ years in the industry."
- Bounce houses "starting at $199."
- Free delivery threshold: orders above $175–$215 in Twin Cities metro (use $175 as the standard line, note St. Cloud area is $300).
- Keep local SEO in mind: city names and "Minneapolis," "Twin Cities," "Minnesota" should appear naturally in headings and copy, not just body text.

## Technical Notes

- Use placeholder/stock-style images for bounce houses, water slides, tents, and families at events — bright, sunny, colorful.
- Build with clean component structure so real product data (name, price, dimensions, photos) can later be wired up to their booking/inventory system (they currently use a booking widget called "Inflatable Office" — leave a clear slot in the product page and header for embedding an external booking widget/cart).
- Fully responsive, click-to-call phone links, accessible color contrast despite the bright palette.

---

Reminder for you (not part of the Lovable prompt): once Lovable generates the first pass, you'll want to swap in real photos of his actual inventory and plug in his real booking/cart widget where the placeholder CTAs are.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/24210d7d-4482-4826-b6b8-c8573ae20c4d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
