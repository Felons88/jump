# Agent Instructions

This file is written for an AI coding agent (Claude, in an IDE) working in this repo. If your tooling reads a root-level `AGENTS.md` automatically, merge this content with it — the existing root `AGENTS.md` currently only contains a Lovable git-history warning; keep that warning, add this.

## Read before you touch anything

1. `01-architecture.md` — know which of the four systems (site / booking / routing / admin) you're working in before writing code.
2. The relevant domain file (`04-booking-engine.md`, `05-payments.md`, `06-delivery-routing.md`, `07-admin-dashboard.md`, `08-security.md`) for the feature you're building.
3. `14-coding-standards.md` for naming/style/folder conventions already established in this repo.

## Hard rules

- **Never fake a working feature.** If you can't wire something to a real backend yet, don't ship a button/form that silently no-ops (`contact.tsx`'s current `onSubmit` is the anti-pattern — it shows a success toast without sending anything anywhere). Either build the real thing or leave it visibly marked as not-yet-available.
- **Never commit secrets.** API keys (Stripe, Google Routes, Twilio, etc.) go in environment variables, never hardcoded, never committed even in a "temporary" test file. Add new env vars to `.env.example` when you add a new key.
- **Never touch payment amounts on the client.** Prices, deposit percentages, and delivery fees are computed server-side. The client requests a quote; it doesn't calculate the final charge.
- **Never rewrite published git history** on the connected branch — this breaks Lovable sync (see the root `AGENTS.md` Lovable notice). No force-push, no rebase/amend of already-pushed commits.
- **Respect the Lovable sync** if it's still active: commits to the connected branch sync back into the Lovable editor. Keep the branch buildable at every commit.

## Before opening a PR / finishing a task

- [ ] Run `bun run lint` and fix anything it flags in files you touched
- [ ] Run `bun run format` (Prettier) — this repo has `.prettierrc` and `.prettierignore`, don't fight them with manual formatting
- [ ] If you touched routing (`src/routes/`), confirm `src/routeTree.gen.ts` regenerates cleanly (TanStack Router codegen) — don't hand-edit that file
- [ ] If you added a new env var, update `.env.example`
- [ ] If you touched booking/payment/routing logic, check it against the relevant business rules in `04-booking-engine.md` / `05-payments.md` / `06-delivery-routing.md` — this domain has real money and real deliveries riding on correctness
- [ ] Mobile check — this is a mobile-first product (see `03-design-system.md`); don't ship something that only looks right at desktop width
- [ ] No hardcoded copy that duplicates `src/data/site.ts` — if it's a phone number, price, city, or FAQ answer, it comes from that data file (or its eventual database replacement), not retyped inline

## When requirements are ambiguous

Prefer asking or flagging the ambiguity over guessing on anything touching:

- money (prices, fees, deposits, refunds)
- delivery addresses/routing logic
- customer PII handling
- security/auth boundaries

For UI copy, layout, or non-critical content decisions, use best judgment against `03-design-system.md` and move forward — don't block on small stuff.

## Repo-specific gotchas

- File-based routing: every `.tsx` in `src/routes/` becomes a route automatically (see `src/routes/README.md`). Adding a file is enough to create a page — don't also hand-register it somewhere.
- `src/components/ui/` is shadcn-generated. Don't hand-edit these to add one-off styling — extend/wrap instead, or the next `shadcn add` / codegen pass will clobber your changes.
- `src/data/site.ts` is the current single source of truth for categories, items, cities, FAQs, pricing. Once a real database exists, this file's shape should become the seed data / migration reference, not a parallel source that can drift from the DB.
- `BookingWidgetSlot` (`src/components/site/Shared.tsx`) is the placeholder every booking CTA currently points at — this is the integration point to replace across the whole site, not just on one page.
