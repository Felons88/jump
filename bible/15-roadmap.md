# Roadmap (Phased Build Order)

Full detail on _why_ each phase is ordered this way lives in `01-architecture.md` (data flow) and the individual domain files. This is the checklist to track against.

## Phase 0 — Fix what's already half-built

- [ ] Wire `contact.tsx` to a real backend (currently a no-op toast)
- [ ] Add spam protection + server-side validation to the contact form
- [ ] Replace `BookingWidgetSlot` placeholders sitewide with the real booking entry point
- [ ] Replace hardcoded placeholder testimonials with real reviews
- [ ] Replace reused stock category images with real product photography
- [ ] Verify/update all pricing in `site.ts` before launch
- [ ] Write real blog article content (currently titles/excerpts only)
- [ ] Rewrite privacy/terms pages to reflect real data practices, not boilerplate

## Phase 1 — Booking & availability engine

See `04-booking-engine.md`. Decide widget-embed vs. custom build first — this decision gates everything else.

## Phase 2 — Payments

See `05-payments.md`. Depends on Phase 1's booking records existing.

## Phase 3 — Delivery routing & logistics

See `06-delivery-routing.md`. Depends on Phase 1 producing confirmed bookings with real geocoded addresses.

## Phase 4 — Admin / booking manager dashboard

See `07-admin-dashboard.md`. Depends on Phases 1–3 having real data to manage.

## Phase 5 — Catalog & content depth

Real photography, galleries, reviews, upsells, comparison views, bundles — see the earlier "top 100" and full build-todo lists for exhaustive detail; `10-content-seo.md` covers the SEO-relevant subset.

## Phase 6 — Local SEO

See `10-content-seo.md` — schema markup, per-city landing pages, sitemap, structured data.

## Phase 7 — Trust & conversion

Real testimonials with photos, consistent trust badges, case studies, referral program.

## Phase 8 — Customer communication

Automated reminders, SMS status updates, order-status lookup page.

## Phase 9 — Operations & inventory

Unit-level tracking, maintenance logs, demand forecasting.

## Phase 10 — Analytics, testing & compliance

Conversion tracking, A/B testing, full accessibility audit (`11-accessibility.md`), PCI review (`08-security.md`), monitoring (`13-deployment-devops.md`).

## Phase 11 — Pre-launch gate

- [ ] All Phase 0 fixes shipped
- [ ] Booking → payment → confirmation tested end-to-end (real test-mode payments)
- [ ] Routing dashboard tested against a realistic multi-stop day
- [ ] Full mobile pass on every page
- [ ] Accessibility checklist (`11-accessibility.md`) cleared
- [ ] Security compliance checklist (`08-security.md`) cleared
- [ ] Real inventory, pricing, and photography fully loaded — zero placeholders remaining
- [ ] Staff trained on the admin dashboard before go-live

## Build order, one line each

```
Fix existing gaps → Booking engine → Payments → Routing → Admin dashboard
   → Catalog/content depth → SEO → Trust/conversion → Communication
   → Operations → Analytics/compliance → Launch
```
