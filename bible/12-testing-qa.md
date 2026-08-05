# Testing & QA

## Why this matters more than usual here

Bugs in the booking/payment/routing flow have same-day, real-world consequences — a broken checkout is lost revenue immediately, a routing bug sends a driver to the wrong address on delivery morning. Test coverage should be heaviest exactly on those paths, not evenly spread.

## Test strategy by layer

### Unit tests

- Pricing/quote calculation logic (subtotal, delivery fee by city, deposit split, discounts) — this is pure logic, should be thoroughly unit tested since a pricing bug directly costs or loses money
- Availability logic (conflict detection, buffer time) — edge cases like back-to-back bookings on the same unit are exactly where bugs hide
- Route optimization input/output shaping (not the optimizer itself, but how bookings get translated into optimizer requests and results back into route records)

### Integration tests

- Full booking creation → payment → confirmation flow against a test Stripe account (Stripe's test mode/test cards)
- Webhook handling (simulate Stripe webhook events, verify signature check rejects unsigned/tampered payloads)
- Admin API role checks — verify a `driver`-role token genuinely cannot hit customer/payment endpoints, not just that the UI hides the button

### End-to-end tests

- Critical path: browse category → product page → add to cart → checkout → payment → confirmation, run against a staging environment on every release
- Admin critical path: log in → view today's bookings → run route optimization → dispatch a route
- Run at both mobile and desktop viewport sizes given the mobile-first requirement (see `03-design-system.md`)

### Manual QA before every release touching booking/payment/routing

- [ ] Full booking flow tested with a real (test-mode) card, including a declined-card scenario
- [ ] Deposit + balance flow tested end to end, not just deposit
- [ ] Cancellation and weather-hold refund paths tested
- [ ] Route optimization tested with a realistic multi-stop day (not just 1–2 bookings)
- [ ] Accessibility spot-check per `11-accessibility.md`
- [ ] Mobile pass on every touched page

## CI gates

- [ ] `bun run lint` passes
- [ ] `bun run format` — no formatting diffs
- [ ] Type check passes (`tsc`)
- [ ] Unit + integration tests pass
- [ ] No new axe accessibility violations on key pages (if automated a11y testing is wired into CI — see `11-accessibility.md`)

## Staging environment

- Mirrors production configuration but uses test-mode payment keys always
- Seeded with realistic fake bookings covering edge cases (same-day bookings on the same item, a booking right at a delivery-fee threshold, a park delivery requiring the 1-hour window) so QA isn't testing against an empty database every time

## Regression watchlist (things that are easy to silently break)

- Delivery fee calculation when `service_cities` data changes
- Availability calendar after a cancellation (does the freed-up date actually reappear as available)
- Route re-optimization after a booking is cancelled post-route-generation
- Contact form submission (this was previously a fake no-op — make sure whatever replaces it stays working, add a synthetic monitoring check per `13-deployment-devops.md`)
