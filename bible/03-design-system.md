# Design System / UI Bible

## Brand direction (from the original spec)

Fun, energetic, colorful — a bounce house company, not a law firm. Bold primary colors, playful rounded typography for headings, but clean enough that a school administrator or corporate event planner trusts it with a deposit. Avoid generic stock-photo feel.

## Mobile-first, non-negotiable

Most visitors search "bounce house rental near me" on a phone. Design and build for a 375–414px viewport first, then scale up. Every new component gets checked at mobile width before desktop.

- Sticky mobile CTA bar for "Check Availability" on long pages (product pages, category pages)
- Click-to-call phone number always tappable, never just styled text
- Forms use appropriate mobile input types (`type="tel"`, `type="date"`, `type="email"` — already used correctly in `contact.tsx`, keep it that way everywhere)
- Tap targets minimum 44x44px

## Component foundation

This repo uses **shadcn/ui on Radix primitives** (`src/components/ui/`) with Tailwind CSS 4. Rules:

- Extend existing primitives (Button, Card, Dialog, etc.) rather than building new one-off components that duplicate them
- Custom site components live in `src/components/site/` (Header, Footer, Shared) — follow that separation: generic UI primitives vs. Jump-City-specific composed components
- Use the `variant`/`size` prop pattern already established (`Button asChild variant="hero" size="xl"`) rather than inline style overrides

## Color & contrast

- Bright primary palette (reds, yellows, blues, teal) is correct for brand — but every text/background pairing must still pass WCAG AA contrast (4.5:1 normal text, 3:1 large text). Bright ≠ low-contrast; test every new color pairing, don't assume.
- Don't rely on color alone to convey status (e.g., "available" vs "booked") — pair with icon or text label.

## Typography

- Display/heading font: playful, rounded, bold — used for H1/H2 and eyebrow labels (already patterned in `PageHero`)
- Body font: clean and highly legible at small sizes — this audience is scanning on a phone, not reading long-form
- Keep heading hierarchy semantic (one H1 per page, don't skip levels) — matters for SEO and accessibility both

## Imagery

- Real product photography, not stock. Every category currently reuses one of 9 generic images (see `05-payments.md`... actually see `15-roadmap.md` Phase 0) — this is a launch blocker, not a nice-to-have.
- Bright, sunny, colorful, real families/kids where used — avoid anything that reads as corporate stock
- Every image needs real, descriptive alt text (see `11-accessibility.md`)

## Core UI patterns to build once, reuse everywhere

- **Availability badge** — same visual pattern wherever an item's booking status shows (category grid, product page, cart)
- **Trust badge row** — "15+ Years," "Fully Insured," "Cleaned & Sanitized," "Free Delivery over $175" — currently only on the homepage; this should be a single reusable component placed consistently (footer or a dedicated strip) sitewide, not re-created per page
- **CTA band** (`CtaBand` in `Shared.tsx`) — already a good reusable pattern, keep using it rather than one-off CTA sections
- **Price display** — always format consistently (e.g., "Starting at $199") using one shared formatting utility, never string-concatenated inline in multiple places

## Booking & checkout UI specifics

- Calendar/date picker: show unavailable dates clearly disabled, not just visually greyed with no explanation
- Cart: always show a running total including delivery fee before the final payment step — no surprise costs at checkout (this is explicitly a stated brand promise: "clear pricing, no surprises")
- Multi-step checkout (date → items → info → payment) should show clear step progress, matching the "How Easy Booking Works" 4-step promise already on the homepage

## Admin dashboard UI (internal tool)

Different rules than the public site — this is a working tool for staff, not a marketing surface:

- Density over whitespace — staff scanning a day's bookings need to see more at once
- Data tables with sort/filter, not card grids
- Keep the same design tokens (colors, type) for brand consistency, but layout patterns can be denser/more utilitarian
- Route/map views need to be usable on a tablet in a warehouse, not just a desktop monitor

## Motion

- Subtle, purposeful only — a hover lift on category cards, a smooth accordion for FAQs (already in place via shadcn Accordion). No motion that delays a user from completing a booking action.
- Respect `prefers-reduced-motion`.

## Definition of "on brand" for any new UI

Before shipping a new page/component, it should pass all four:

1. Works cleanly at 375px width first
2. Passes AA contrast
3. Uses existing shadcn primitives/tokens rather than new one-offs
4. Reads as "fun and colorful" without undermining "trustworthy enough for a deposit"
