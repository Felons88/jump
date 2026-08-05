# Admin / Booking Manager Dashboard

## Purpose

The internal tool staff use to run the day-to-day business — separate application concerns from the public marketing site (see `01-architecture.md`). Auth-gated, never publicly indexed or linked from the public site.

## Roles (minimum viable)

- **Owner/Admin** — full access, including reporting, staff management, refund approval
- **Office staff** — bookings, customer records, dispatch, day-to-day operations
- **Driver** (optional, if drivers get direct app/dashboard access rather than just receiving pushed routes) — read-only view of their own assigned stops, can update delivery status

Build role checks server-side on every admin API route — never rely on the UI simply hiding a button as the only protection.

## Core views

### Booking calendar / list

- Day/week/month calendar view of all bookings, filterable by status, driver, item category
- Click into any booking for full detail: customer, items, address, payment status, notes
- Manual booking creation for phone/email orders (not every customer books online — front desk needs this)

### Customer records (CRM)

- Booking history per customer
- Contact info, notes (e.g., "gate code 1234", "prefers text over calls")
- Repeat-customer flagging (schools/churches booking annually are a named segment — surface this so staff can proactively reach out before next season)

### Inventory management

- Item and unit-level status: active, out-for-cleaning, damaged, retired
- Low-inventory / near-fully-booked alerts for popular items on busy weekends
- Maintenance/cleaning log per unit, tied to booking history (which booking was it out on before this cleaning entry)

### Dispatch / routing (see `06-delivery-routing.md` for the routing logic itself)

- Run optimization for a date, review/adjust routes, assign drivers
- Live map + stop-status view

### Payments & reconciliation (see `05-payments.md`)

- View payment status per booking (deposit paid, balance due, fully paid, refunded)
- Manual refund/adjustment tool with staff-entered reason, logged
- Reconciliation view matching Jump City's internal booking records against Stripe/Square activity

### Documents

- Insurance certificate generator — schools/churches/cities ask for a certificate of insurance (already promised in the FAQ copy); staff should be able to generate one tied to a specific booking/customer without leaving the dashboard
- Rental agreement e-signature capture at checkout, viewable/downloadable per booking from admin

### Reporting

- Revenue by category/time period
- Busiest days/seasons
- Repeat customer rate
- Damage/incident report log

## Non-goals for v1

Don't over-build the admin tool before the booking + payment + routing core is solid — a fancy reporting dashboard is worthless without real booking data flowing into it. Sequence: bookings work → payments work → routing works → then invest in reporting/analytics depth.

## UI notes

See `03-design-system.md` "Admin dashboard UI" section — this is a working tool, prioritize information density and speed of use over marketing-site polish, while keeping shared design tokens for brand consistency.
