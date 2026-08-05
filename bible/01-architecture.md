# Architecture

## The four systems

Jump City isn't one app — it's four, sharing a database:

1. **Marketing site** (exists today) — TanStack Start SSR site. Public, SEO-critical, mostly read-only content plus the booking entry points.
2. **Booking engine** — availability, cart, checkout. Customer-facing, needs to be fast and mobile-first.
3. **Routing/dispatch service** — internal only. Takes confirmed bookings with addresses and produces optimized driver routes.
4. **Admin dashboard** — internal only, auth-gated. Staff manage bookings, inventory, customers, routes, and reports here.

Keep these as separable concerns even if they ship in the same repo/deploy initially. Don't let admin-only logic (auth, roles, reporting queries) leak into the public site bundle, and don't let routing/dispatch logic block the checkout request path.

## Current stack (existing repo)

- **Framework:** TanStack Start (SSR React), TanStack Router (file-based routing in `src/routes/`)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui components on Radix primitives (`src/components/ui/`)
- **Forms/validation:** react-hook-form + zod (already a dependency, not yet used for the contact form — it should be)
- **State/data fetching:** TanStack Query is a dependency but not yet wired to any real data source
- **Package manager/runtime:** Bun (`bun.lock`, `bunfig.toml`)
- **Build:** Vite
- **Deploy target:** Nitro (in devDependencies) — confirm hosting target (Cloudflare/Vercel/Node) before building server routes that assume a specific runtime

## What needs to be added

### Database

Pick one relational store (Postgres strongly recommended — booking systems are relational: bookings, items, customers, addresses, routes all reference each other with real constraints). Supabase or Neon are reasonable managed choices if you want hosted Postgres with less ops overhead; plain Postgres + an ORM (Drizzle recommended — TypeScript-native, pairs well with this stack) works too.

### API layer

TanStack Start supports server functions/API routes in the same app — use these for booking, payment, and routing endpoints rather than spinning up a separate service initially. Split into a separate backend only when the routing/optimization workload genuinely needs different scaling characteristics than the SSR site (it likely will eventually — route optimization is CPU-heavier and runs in batches, not on every page request).

### Auth

Needed only for the admin dashboard and any customer account features. Use a proven provider (Clerk, Auth.js/NextAuth-style, or Supabase Auth if already on Supabase) rather than rolling your own session/password system — see `08-security.md`.

### Third-party services to integrate

- Payments: Stripe (recommended — best deposit/partial-capture support) or Square
- Geocoding + route optimization: Google Routes API or Mapbox Optimization API
- Email: Resend or SendGrid
- SMS: Twilio
- Reviews: Google Business Profile API (read-only pull)

## Data flow, end to end

```
Customer books on marketing site
        ↓
Booking engine validates availability, creates booking (status: pending)
        ↓
Payment (deposit or full) processed → booking status: confirmed
        ↓
Booking address geocoded (on creation, not batched later)
        ↓
Admin dashboard shows confirmed booking on the calendar
        ↓
Night before / morning of: dispatch runs route optimization across
all confirmed same-day bookings
        ↓
Routes assigned to drivers/trucks → pushed to admin dashboard + driver view
        ↓
Driver marks delivered → status updates flow back to booking record
        ↓
Pickup routing runs as its own optimization pass (different addresses/times)
```

## Environments

- **Local** — Bun dev server, local/dev database (never point local dev at production data)
- **Staging** — mirrors production, used for QA before every release, seeded with realistic-but-fake bookings
- **Production** — real payments, real customer data. Restrict admin dashboard access here to staff accounts only.

## Boundaries an agent should respect

- Don't add payment logic to page components — route it through a dedicated server function/API route that's the single place Stripe is touched.
- Don't compute delivery fees in the UI from `serviceCities` directly once a real backend exists — the backend is the source of truth; the UI displays what the backend returns.
- Don't let the routing/optimization job run synchronously inside a customer-facing request — it's a dispatch-side batch operation.
