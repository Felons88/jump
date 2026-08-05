# Payments

## Provider

**Stripe** is the recommended default — best support for partial capture (deposit now, balance later), saved payment methods, and strong docs for exactly this deposit-then-balance flow. Square is a reasonable alternative if Jump City already uses Square for in-person/POS and wants one reconciliation system.

## Never touch card data directly

Use Stripe Elements / Payment Element (or Square's equivalent) on the client — card numbers never pass through Jump City's own servers. This is what keeps PCI compliance scope small (SAQ A rather than a much heavier assessment). Do not build a custom card form that submits raw card numbers to your own API.

## Flow

### Deposit path (default)

1. Customer completes cart, chooses "pay deposit" (50%, per business rule in `04-booking-engine.md`)
2. Stripe PaymentIntent created for the deposit amount
3. On success → booking status `confirmed`, remainder tracked as `balance_due` with a due date (before setup / event day)
4. Automated reminder email/SMS ahead of the balance due date (see `04-booking-engine.md` communication hooks)
5. Balance charged via saved payment method (with customer consent captured at booking) or customer pays manually via a link before the event

### Full payment path

1. Same flow, single PaymentIntent for the full amount, booking goes straight to `confirmed` with no balance

### Refunds / cancellations

- Cancellation ≥24hrs out: full refund of whatever was paid, no penalty (per stated policy)
- Weather-hold cancellation: full refund, always, regardless of notice window — this is a customer trust commitment already made in the site's FAQ copy, don't undercut it in code
- Late cancellation (<24hrs, non-weather): staff discretion — build the refund tool to allow partial/full/no refund by staff decision, don't hardcode a punitive rule the business hasn't actually decided on

### Corporate / school billing

- Net-30 invoice option for schools/churches/cities that can't pay by card at booking time — these are explicitly called out as a customer segment (see events data in `site.ts`). Build this as an alternate checkout path, not a workaround staff does manually outside the system (or bookings won't show correctly in routing/admin).

## Pricing integrity

- Delivery fee, subtotal, deposit amount, and any discount are **always computed server-side** at the moment of charge — never trust a total posted from the client.
- Re-validate pricing against current `Item`/`ServiceCity` data even if the cart was built minutes earlier — prices shouldn't silently change mid-session, but the charge amount must come from a fresh server calculation, not a client-supplied number.

## Taxes

- Minnesota sales tax applies to rentals — calculate correctly by delivery jurisdiction (rates can vary by city/county). Use Stripe Tax or a dedicated tax API (Avalara, TaxJar) rather than a single hardcoded rate once operating across many Twin Cities suburbs with different local rates.

## Receipts & records

- Auto-generate a PDF receipt/invoice on both deposit and balance payment
- Every payment event (deposit, balance, refund) is logged against the booking record — the admin dashboard's payment reconciliation view (see `07-admin-dashboard.md`) reads from this log, not from Stripe's dashboard directly

## Compliance

See `08-security.md` for the full security posture. Payment-specific compliance notes:

- PCI scope stays minimal (SAQ A) as long as card data never touches Jump City's own servers — enforce this architecturally, don't rely on developer discipline alone
- Webhook signature verification is mandatory on all Stripe webhook endpoints — never process a payment-confirmed event without verifying it actually came from Stripe
