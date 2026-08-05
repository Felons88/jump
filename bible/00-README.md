# The Jump City Bible

This is the standing reference for building **Jump City Inflatable Rentals** into a real booking + delivery-routing platform, not just a marketing site. It's written to be fed to an AI coding agent (Claude in your IDE) as persistent project context — treat every file here as a spec your agent should follow, not a suggestion.

## How to use this with your coding agent

- Drop this whole folder into the repo root as `/docs/bible/` (or wherever your agent config points).
- `02-agents.md` is written in the AGENTS.md convention — if your IDE/agent auto-reads an `AGENTS.md` at repo root, either point it at this file or merge it with the existing root `AGENTS.md` (which currently only has Lovable's git-history warning).
- Each file is self-contained. Point the agent at the specific file relevant to the task ("read `04-booking-engine.md` before touching booking code") rather than the whole bible every time — keeps context tight.
- Files with checklists (`15-roadmap.md`, `11-accessibility.md`, `12-testing-qa.md`) are meant to be checked off as work lands, not just read once.

## Current reality (as of this writing)

The existing codebase (`jump-city-bounce-redesign-main`) is a **TanStack Start + React 19 + shadcn/ui marketing site**, generated via Lovable from a detailed prompt. It has:

- Full page structure: home, category pages, product pages, events, service areas, about, contact, FAQ, blog
- Real copy and a real data model for categories/items/cities/FAQs in `src/data/site.ts`
- Zero backend. The contact form doesn't submit anywhere. Every "Check Your Date" button points at an empty placeholder (`BookingWidgetSlot` in `src/components/site/Shared.tsx`) meant for an external widget called "Inflatable Office."
- No payments, no cart, no delivery routing, no admin dashboard, no auth.

Everything in this bible assumes that starting point.

## File index

| File                      | Covers                                                     |
| ------------------------- | ---------------------------------------------------------- |
| `01-architecture.md`      | System boundaries, tech stack, how the pieces fit together |
| `02-agents.md`            | Rules for AI coding agents working in this repo            |
| `03-design-system.md`     | Brand, UI, components, responsive rules                    |
| `04-booking-engine.md`    | Booking data model, states, business rules                 |
| `05-payments.md`          | Checkout, deposits, refunds, providers                     |
| `06-delivery-routing.md`  | Route optimization, dispatch logic                         |
| `07-admin-dashboard.md`   | Internal booking-manager tool spec                         |
| `08-security.md`          | Auth, secrets, threat model, compliance                    |
| `09-data-model-api.md`    | Database schema + API contract                             |
| `10-content-seo.md`       | Local SEO, schema markup, content rules                    |
| `11-accessibility.md`     | WCAG checklist and patterns                                |
| `12-testing-qa.md`        | Test strategy and CI gates                                 |
| `13-deployment-devops.md` | Environments, CI/CD, monitoring                            |
| `14-coding-standards.md`  | Style, naming, folder/git conventions                      |
| `15-roadmap.md`           | Phased build order, condensed                              |

## Non-negotiable principles

1. **Never fake a working feature.** If something isn't wired up, it's clearly marked TODO or hidden — never a button that silently does nothing (the current contact form is the example to avoid repeating).
2. **Mobile-first, always.** Most traffic is a parent on a phone searching "bounce house rental near me" at 9pm. Every feature ships mobile-first, desktop is the enhancement.
3. **Money and addresses are never guessed.** Pricing, availability, and delivery fees come from a single source of truth (the database, once it exists) — never hardcoded in two places that can drift.
4. **Real inventory and photos before launch.** No stock-photo placeholders, no fake testimonials, in production.
5. **Every backend feature has an owner: booking engine → payments → routing → admin.** Build in that order — routing needs bookings with real addresses, admin needs both to manage.
