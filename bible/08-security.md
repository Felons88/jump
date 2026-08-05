# Security

## Threat model summary

This system will hold: customer PII (names, addresses, phone, email), payment activity (via Stripe/Square, not raw card data), booking/business data, and staff credentials for an admin tool that can issue refunds and see all customer records. Treat it accordingly — this is a real small-business system with real money and real people's home addresses in it, not a toy project.

## Authentication

- **Admin dashboard:** use a proven auth provider (Clerk, Auth.js, or Supabase Auth) rather than hand-rolled sessions/password hashing. Enforce MFA for admin/owner-level accounts at minimum — this role can issue refunds and see the full customer database.
- **Customer accounts (if built):** same principle — don't hand-roll. Password reset flows, session handling, and credential storage are exactly the kind of thing that's easy to get subtly wrong.
- **Role-based access control:** every admin API route checks role server-side (see `07-admin-dashboard.md`). A driver role should not be able to hit customer-payment endpoints even if they somehow know the URL.

## Secrets management

- All API keys (Stripe, Google Routes, Twilio, email provider, database credentials) live in environment variables, never in source, never in client-side bundles.
- Separate keys per environment (dev/staging/production) — a staging environment should never hold live Stripe keys.
- `.env.example` kept up to date with every required key name (no real values) so the agent and any new developer can see what's needed without guessing.

## Payment security

- Card data never touches Jump City's own servers — Stripe/Square Elements handles card entry client-side, only tokens/PaymentIntents flow through the backend. This keeps PCI scope to SAQ A. See `05-payments.md`.
- All payment webhooks verify signatures before processing — never trust an unverified POST claiming a payment succeeded.

## Data protection

- Encrypt data at rest (default with any reputable managed Postgres provider) and in transit (HTTPS everywhere, no exceptions, including internal admin routes).
- Minimize what's stored: don't store full card numbers (Stripe/Square handle this), don't store more customer PII than the booking flow actually needs.
- Define a data retention policy for cancelled/completed bookings and old customer records — align with what the (currently generic) privacy policy says once it's rewritten to reflect real practice (see `15-roadmap.md` Phase 0).
- Backups: automated, regular, and periodically tested (a backup nobody has ever restored from is not a real backup).

## Application security basics

- Input validation server-side on every endpoint (zod is already a dependency — use it consistently for API input schemas, not just client-side form validation)
- Rate limiting on public endpoints — the contact form and booking creation endpoints are the most likely spam/abuse targets
- CSRF protection on state-changing requests
- Dependency updates kept current — this is a Bun/Vite/React 19 stack with many dependencies; don't let security patches lag
- No secrets or stack traces leaked in error responses shown to end users

## Admin-specific hardening

- Session timeout for admin dashboard logins
- Audit log of sensitive actions: refunds issued, bookings cancelled, customer records viewed/edited, inventory marked damaged — who did what, when. This matters both for security and for resolving customer disputes ("who cancelled my booking?").
- Admin dashboard never publicly linked or indexed — separate subdomain or path with its own auth wall, `noindex` regardless.

## Incident readiness

- Uptime/error monitoring on the booking and payment flow specifically — a silent failure in checkout is lost revenue and a bad customer experience, catch it fast (see `13-deployment-devops.md`).
- Have a documented plan for "what do we do if a payment webhook fails" and "what do we do if the routing job fails the morning of deliveries" — these are the two failure modes with real-world same-day consequences.

## Compliance checklist before accepting real payments

- [ ] Card data confirmed to never pass through Jump City's own servers (Stripe/Square Elements only)
- [ ] Webhook signature verification in place on all payment webhooks
- [ ] Privacy policy rewritten to accurately describe real data practices (not generic boilerplate)
- [ ] HTTPS enforced everywhere, including admin
- [ ] MFA enabled for admin/owner accounts
- [ ] Backups automated and restore-tested at least once
