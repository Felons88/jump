# Booking Engine

## Purpose

The system of record for what's rented, by whom, for when, and whether it's paid for. Everything else (payments, routing, admin) reads from and writes to this.

## Core entities

- **Item** — a single rentable unit type (e.g., "Purple Crush Combo"). Fields: name, category, price-from, dimensions, age range, images, description, active/inactive. Seed from `src/data/site.ts` categories/items.
- **Unit** — a _physical_ instance of an item, if you track individual units for maintenance/damage tracking (recommended once inventory grows — "Purple Crush Combo #2 is out for cleaning" needs a unit-level record, not just an item-level one).
- **Booking** — a customer's reservation. Fields: customer, event date, delivery address, delivery window type, items[], subtotal, delivery fee, deposit amount, balance amount, status, created/confirmed timestamps.
- **Customer** — name, phone, email, address history, booking history, notes.
- **Availability** — derived, not stored directly: an item is available on a date if no confirmed/pending booking already holds it (accounting for buffer time — see below).

## Booking statuses

```
draft        → cart in progress, not yet submitted
pending      → submitted, awaiting payment
confirmed    → deposit or full payment received
in_progress  → delivery day, item is out
completed    → picked up, event over
cancelled    → cancelled by customer or staff
weather_hold → cancelled specifically for weather, no penalty (per stated policy)
```

Only `confirmed` and later statuses should ever appear on the routing/dispatch side — routing never plans around a `pending` booking that hasn't paid.

## Business rules (already promised in site copy — treat these as requirements, not suggestions)

- **Deposit:** 50% holds the date; balance due before setup. Full payment allowed at checkout too.
- **Cancellation:** 24 hours' notice, no penalty.
- **Weather:** sustained wind over 20mph or severe weather forecast → staff-initiated hold, customer never charged for a weather cancellation Jump City calls.
- **Delivery windows** (already priced in `src/data/site.ts` → `deliveryOptions`):
  - Standard: free (over $175 metro / $300 St. Cloud subtotal), delivered 12–48 hrs ahead
  - Event Day: $49, delivered as early as 11am
  - 1-Hour Window: $79, required for park deliveries
- **Buffer time:** build in cleaning/inspection time between bookings of the same physical unit — don't allow a same-day double-turn without it unless explicitly staffed for it.
- **Surface restrictions:** grass preferred/free; asphalt/concrete/indoor gym floor supported via sandbags; sand/gravel/rocky ground not supported — surface a warning if a customer's address type is known to be unsuitable (can't fully validate this automatically, but the checkout should ask and store the answer).
- **Clearance:** 20ft from power lines, 3ft clear gate/path — checkout should collect enough info (or at minimum display this requirement clearly) before confirming.
- **Multi-day/weekend discounts:** apply automatically in cart pricing, not manually by staff after the fact.

## Availability logic

An item is bookable on a date if:

1. No existing `confirmed` or `pending` booking holds that item (or that specific unit, if unit-level tracking is in place) for that date, accounting for buffer time before/after
2. The date isn't in a staff-set blackout window
3. If weather-hold logic exists, the date isn't already flagged

Never allow the UI to show "available" based on stale cached data at checkout — re-validate availability server-side at the moment of payment, not just when the item was added to cart (classic race condition: two customers add the same last unit within minutes of each other).

## API surface (suggested)

```
GET  /api/availability?item=slug&month=2026-08     → available dates for an item
POST /api/cart                                       → create/update cart
POST /api/bookings                                    → submit booking (creates status=pending)
POST /api/bookings/:id/confirm                        → called after successful payment
POST /api/bookings/:id/cancel                         → customer or staff cancellation
POST /api/bookings/:id/reschedule                      → self-service reschedule
GET  /api/bookings/:id                                 → booking detail (customer-facing status lookup)
```

Server-side re-validates availability and re-computes pricing on every write — never trust client-submitted totals.

## What replaces `BookingWidgetSlot`

Decide early: embed the existing "Inflatable Office" widget (fastest path, keeps their current backend) vs. build the above custom. If embedding, this whole file still matters as documentation of the business rules the embedded widget needs to reflect (deposit %, cancellation window, delivery pricing) — verify the third-party widget actually enforces these, don't assume.
