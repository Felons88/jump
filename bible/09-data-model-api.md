# Data Model & API

## Recommended stack

Postgres (managed — Supabase or Neon are both reasonable) + Drizzle ORM (TypeScript-native, fits this stack well) + zod for runtime validation of API inputs/outputs.

## Core tables (starting point — refine as real requirements surface)

```
categories
  id, slug, name, tagline, description, image_url

items
  id, category_id (fk), slug, name, price_from, dimensions,
  age_range, blurb, active (bool)

units                          -- physical instances, optional but recommended
  id, item_id (fk), label (e.g. "Combo #2"), status
  (active | cleaning | maintenance | retired)

customers
  id, name, phone, email, created_at

addresses
  id, customer_id (fk), street, city, state, zip,
  lat, lng (geocoded on save), notes (gate code, access notes)

service_cities
  id, city_name, free_delivery (bool), delivery_note, subtotal_minimum

bookings
  id, customer_id (fk), address_id (fk), event_date,
  delivery_window_type (standard | event_day | one_hour),
  status (draft | pending | confirmed | in_progress | completed |
          cancelled | weather_hold),
  subtotal, delivery_fee, tax, deposit_amount, balance_amount,
  balance_due_date, created_at, confirmed_at

booking_items
  id, booking_id (fk), item_id (fk), unit_id (fk, nullable), quantity

payments
  id, booking_id (fk), type (deposit | balance | refund),
  amount, provider_ref (Stripe/Square id), status, created_at

routes
  id, route_date, driver_id (fk), vehicle_label, pass_type
  (delivery | pickup), status

route_stops
  id, route_id (fk), booking_id (fk), sequence, eta,
  status (pending | en_route | completed)

staff_users
  id, name, email, role (admin | office | driver), auth_provider_id

audit_log
  id, staff_user_id (fk), action, target_type, target_id, created_at
```

## Key constraints/rules to enforce at the DB layer, not just app code

- A `unit` cannot appear in two overlapping `booking_items` (via bookings with status `confirmed`+) for overlapping date ranges, accounting for buffer time — enforce with a real constraint/check where the DB supports it, or at minimum a transaction-safe check at write time, not just a UI-level check.
- `payments.amount` totals for a booking should never exceed what's owed — reconciliation logic should be able to trust the payments table as ground truth.
- Foreign keys enforced (no orphaned `booking_items` pointing at a deleted booking).

## API contract (REST, matches `04-booking-engine.md` and `06-delivery-routing.md`)

### Public/customer-facing

```
GET  /api/categories
GET  /api/categories/:slug/items
GET  /api/items/:slug
GET  /api/items/:slug/availability?month=YYYY-MM
POST /api/cart
POST /api/bookings                 (creates status=pending)
POST /api/bookings/:id/pay         (creates Stripe PaymentIntent)
GET  /api/bookings/:id             (status lookup, requires booking id + email/phone match)
POST /api/bookings/:id/cancel
POST /api/bookings/:id/reschedule
POST /api/contact                  (real submission, not the current no-op)
```

### Admin-only (auth required, role-checked)

```
GET   /api/admin/bookings?date=&status=&driver=
POST  /api/admin/bookings           (manual booking entry)
PATCH /api/admin/bookings/:id
GET   /api/admin/customers
GET   /api/admin/customers/:id
PATCH /api/admin/units/:id/status
POST  /api/admin/routes/optimize    (runs optimization for a date)
PATCH /api/admin/routes/:id/stops/:stopId   (reorder, reassign)
POST  /api/admin/routes/:id/dispatch        (push to drivers)
GET   /api/admin/reports/revenue
GET   /api/admin/reports/routes
POST  /api/admin/certificates/insurance     (generate COI PDF)
```

### Webhooks

```
POST /api/webhooks/stripe          (signature-verified, see 08-security.md)
```

## Validation

Every endpoint validates its input with a zod schema before touching the database — this repo already depends on zod, use it consistently rather than only on the client-side forms it's currently used for.

## Versioning note

Don't over-design this schema before real usage data exists — this is a solid v1 starting point, not a permanent contract. Expect to add fields (e.g., discount codes, referral tracking) as the business actually needs them.
