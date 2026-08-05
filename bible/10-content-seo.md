# Content & Local SEO

## Positioning (from the original brief — keep consistent everywhere)

"Minnesota's Trusted Bounce House & Party Rentals" — Twin Cities metro + St. Cloud area. Family-owned, 15+ years, fully insured, commercial-grade vinyl, cleaned & sanitized between every rental.

## Repeat phrases intentionally, everywhere they're true

These aren't just homepage copy — they should appear naturally across category pages, product pages, and city/event pages wherever accurate:

- "Delivery, setup, and pickup included"
- "Cleaned and sanitized between every rental"
- "Commercial-grade vinyl"
- "Fully insured"
- "Family owned and operated"
- "15+ years in the industry"

## Local SEO structure

- City names ("Minneapolis," "St. Paul," "Twin Cities," "Minnesota") should appear naturally in **headings**, not buried only in body paragraphs — this matters for how search engines weight local relevance.
- Individual landing pages for top service cities (Minneapolis, St. Paul, Woodbury, Eagan, Bloomington, Minnetonka, etc.) rather than only the single shared service-area table currently in `service-areas.tsx` — a dedicated page per major city ranks better for "[city] bounce house rental" searches than one page trying to rank for all of them.
- Each city page should have at least some unique content (not just the same paragraph with the city name swapped) — mention nearby parks, typical event types for that area if known, etc.

## Structured data (schema.org) — none currently implemented

- `LocalBusiness` schema on the homepage/about/contact — name, address, phone, hours, service area, price range
- `Product` schema on individual item pages — name, price, availability
- `FAQPage` schema on the FAQ page (`faqs.tsx`) — the FAQ content already exists in `site.ts`, just needs the schema markup wrapper
- `Review`/`AggregateRating` schema once real reviews are integrated (see `15-roadmap.md`)

## On-page SEO checklist per page

- [ ] Unique, descriptive `<title>` and meta description (the existing routes already set some of this via `head()` — extend the pattern to every route, verify none are missing/duplicated)
- [ ] One semantic H1 per page
- [ ] Descriptive alt text on every image (also an accessibility requirement, see `11-accessibility.md`)
- [ ] Internal links between related pages (blog post → relevant category page, event page → relevant categories — `eventTypes` in `site.ts` already has a `categories` field for this, make sure it's actually rendered as links)
- [ ] Canonical URL set correctly, no duplicate-content traps between similar city/category pages

## Blog / content marketing

- The 4 existing blog posts in `site.ts` are titles/excerpts only — no full article content exists yet. Writing the actual articles is a content task, not a dev task, but the dev work is: full article rendering (currently just a list), proper article schema, and internal links out to relevant categories.
- Good future topics beyond the existing 4: seasonal guides (spring rental prep, winter storage questions), event-type-specific guides (a real "how to plan a school field day" guide expanding on the `school-events` event type), city-specific event roundups.

## Reviews

- Replace hardcoded testimonial names/cities in `index.tsx` with a real Google Reviews API pull — fake-looking testimonials undermine the exact trust the brand is trying to build (this is also a legal/ethical issue if the names/quotes are entirely fabricated rather than lightly-illustrative placeholders — get real reviews in before launch).

## Content governance going forward

- Pricing, FAQ answers, and policy language (cancellation, deposit %, delivery pricing) all live in one place (`site.ts` today, the database eventually) — never let a page hardcode a policy statement that could drift from the canonical source.
