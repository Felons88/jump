# Delivery Routing & Logistics

## Purpose

Turn a day's confirmed bookings into efficient driver routes — this is the piece that doesn't exist anywhere in the current codebase and is explicitly one of the two things (alongside booking) this whole rebuild is for.

## Inputs

- All `confirmed` bookings for a given delivery date (pending/unpaid bookings are never routed — see `04-booking-engine.md`)
- Each booking's geocoded delivery address (geocode at booking creation time, not in a batch job later — a bad address should surface immediately, not the morning of delivery)
- Delivery window type (Standard / Event Day / 1-Hour) — 1-hour window bookings (required for park deliveries) get hard time constraints; Standard bookings are flexible within their 12–48hr window
- Item size/weight (affects which truck it fits on and how many crew to load/unload it)
- Available trucks and crews for that day (staff-entered in admin)

## Route optimization

Use a real routing/optimization API rather than hand-rolled nearest-neighbor logic — this problem (vehicle routing with time windows and capacity constraints) is well-studied and gets hard fast with more than a handful of stops.

- **Google Routes API** (Route Optimization) or **Mapbox Optimization API** are the two reasonable choices — pick based on whichever mapping provider is already used for the service-area map on the marketing site, for consistency.
- Constraints to feed the optimizer:
  - Truck capacity (volume/weight per vehicle)
  - Hard time windows for 1-Hour Window bookings
  - Soft time windows for Standard/Event Day bookings
  - Setup/breakdown time per item type as service duration at each stop (a water slide takes longer to set up than a Giant Connect Four — don't treat all stops as equal duration)
  - Drive-time between stops from real traffic-aware routing, not straight-line distance

## Two separate optimization passes

Don't conflate drop-off and pickup into one pass — they usually happen on different days/times with different constraints:

- **Delivery pass** — morning of / day before, per the delivery window rules above
- **Pickup pass** — typically next business day for Standard, same-day-late for Event Day — run as its own optimization with its own constraints

## Dispatcher tools (admin-facing)

- Run optimization for a selected date, review the proposed routes
- Manual drag-and-drop override — the optimizer's output is a starting point; a dispatcher who knows a driver is unavailable or a street is under construction needs to adjust it
- Assign routes to specific driver/truck/crew
- Push the finalized route to drivers — turn-by-turn links per stop (a plain list of Google Maps links per stop is a perfectly good v1; a dedicated driver app is a later enhancement)
- Live status: each stop updates to "en route → delivered" (or "picked up") as the driver progresses, visible on the admin dashboard in real time

## Status feedback loop

Driver-reported delivery status writes back to the booking record (`04-booking-engine.md` status: `confirmed` → `in_progress` → `completed`). This is what makes the admin dashboard's "today's deliveries" view trustworthy instead of stale.

## Customer-facing notification (optional, later phase)

"Your driver is on the way" SMS is a nice trust-building touch once the core routing/status loop is solid — don't build this before the underlying status tracking is reliable, or it'll notify customers with wrong information.

## Edge cases to design for from day one

- Same address needs two deliveries in one day (e.g., a school ordering a bounce house from two different bookings) — the router should recognize this as one stop, not two, when addresses match
- A booking gets cancelled or rescheduled after routes are already generated for that day — re-running optimization needs to be cheap and safe to do repeatedly, not a one-shot operation
- Park deliveries with permit time constraints (see `04-booking-engine.md` — 1-hour window is required for these) — these should be flagged distinctly in the dispatcher UI so a dispatcher never accidentally treats one as flexible

## Reporting

Track and surface: miles driven per day, stops per driver, on-time delivery rate, average setup time by item type. This data both proves ROI on building routing at all and feeds future route-planning improvements (e.g., realizing a certain item consistently takes longer to set up than estimated).
