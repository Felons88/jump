# Coding Standards

## Stack conventions already established — follow them, don't reinvent

- **Package manager:** Bun (`bun.lock`, `bunfig.toml`) — use `bun install`/`bun run`, not npm/yarn, to avoid lockfile conflicts
- **Routing:** TanStack Router, file-based (`src/routes/`). Adding a `.tsx` file there creates a route automatically — see `src/routes/README.md`. Don't hand-edit `src/routeTree.gen.ts`, it's generated.
- **UI components:** shadcn/ui on Radix, in `src/components/ui/`. Don't hand-modify these generated primitives for one-off needs — wrap or extend instead, or a future `shadcn add`/regeneration will clobber changes.
- **Site-specific components:** `src/components/site/` — this is where Jump-City-specific composed components belong (Header, Footer, Shared patterns like `CtaBand`, `PageHero`, `BookingWidgetSlot`)
- **Data:** `src/data/site.ts` is the current single source of truth for categories, items, cities, FAQs. Follow its existing shape (typed objects, helper functions like `item()`) when extending it, and treat it as the seed-data reference once a real database replaces it — don't create a second, parallel data source that can drift.
- **Forms:** react-hook-form + zod are already dependencies — use them for all forms, including replacing the current unvalidated `contact.tsx` form.
- **Styling:** Tailwind CSS 4 utility classes, following the existing pattern of `variant`/`size` props on components (see `Button asChild variant="hero" size="xl"` usage) rather than ad hoc inline styles.
- **Linting/formatting:** ESLint + Prettier are configured (`eslint.config.js`, `.prettierrc`, `.prettierignore`). Run `bun run lint` and `bun run format` before considering work done — don't hand-format against the grain of what Prettier already enforces.

## Naming

- Route files: match TanStack Router's existing pattern (`rentals.$category.$item.tsx` for nested dynamic segments) — follow the established naming, don't introduce a different routing convention partway through.
- Component files: PascalCase matching the exported component name (`Header.tsx`, `Shared.tsx`) — consistent with what's already there.
- Data/type names: the existing `RentalItem`, `Category`, `EventType`, `ServiceCity` types in `site.ts` are the pattern to extend when adding new data shapes (`Booking`, `Customer`, etc.) — keep the same descriptive, singular naming style.

## TypeScript

- Strict typing — the existing codebase types its data structures explicitly (see `site.ts`); new backend code (booking, payment, routing logic) should be equally strict, especially around money (use a consistent numeric/decimal handling approach, don't mix floats carelessly for currency) and dates (be explicit about timezone handling — Minnesota, Central time, and be careful around daylight saving transitions for anything scheduling deliveries).

## Git / PR conventions

- Keep the connected branch buildable at every commit (Lovable sync — see `02-agents.md`)
- No force-push / history rewrite on the synced branch
- Small, reviewable commits/PRs over large sweeping ones, especially for anything touching money, addresses, or auth
- PR description should note which bible file(s) the change follows (e.g., "per `04-booking-engine.md` cancellation rules") when implementing a documented business rule — makes review faster and keeps the bible and the code from drifting apart

## Comments

- Comment _why_, not _what_, especially for business-rule logic (e.g., why buffer time exists between bookings, why weather-hold refunds are unconditional) — a future developer or agent should be able to find the reasoning without re-deriving it from `04-booking-engine.md`.

## Don't repeat business rules in multiple places

Deposit percentage, cancellation window, delivery pricing thresholds, wind-speed cancellation trigger — each of these should exist in exactly one place in the code (config/database), referenced everywhere it's needed, never copy-pasted as a literal in multiple files. This is the single most common way a rules document like this one silently goes stale against the real code.
