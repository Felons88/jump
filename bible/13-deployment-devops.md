# Deployment & DevOps

## Environments

- **Local** — Bun dev server (`bun run dev` / Vite dev), local or dev-tier database, test-mode payment keys always
- **Staging** — production-like config, test-mode payment keys, seeded realistic data, used for QA before every release (see `12-testing-qa.md`)
- **Production** — live payment keys, real customer data, restricted admin access

Never let staging and production share a database. Never let a developer's local environment hold production credentials.

## Hosting

The repo's devDependencies include Nitro, meaning it's set up to deploy to a Nitro-supported target (Cloudflare Workers, Vercel, Node server, etc.) — confirm which target before building server-side features (payment webhooks, routing jobs) that assume a specific runtime's capabilities (e.g., long-running background jobs behave very differently on an edge/serverless runtime vs. a persistent Node server).

## CI/CD

- Every push to a feature branch: lint, format check, type check, unit/integration tests (see `12-testing-qa.md` for the full gate list)
- Every merge to the connected branch: **remember this repo syncs to Lovable** — keep the branch buildable at every commit, don't merge broken intermediate states even temporarily (see `02-agents.md`)
- Staging deploy on merge to a staging branch; production deploy is a deliberate, reviewed step — not automatic on every merge, given real payments are involved

## Background jobs

- Route optimization runs as a scheduled/triggered job (e.g., early morning for that day's deliveries, or on-demand when a dispatcher clicks "optimize"), not inline in a customer-facing request path
- Balance-payment reminders, pre-event reminders, post-event review requests — all scheduled jobs, need a reliable job runner/scheduler appropriate to the chosen hosting target

## Monitoring

- **Uptime monitoring** on the public site and, separately, on the booking/checkout flow specifically — a site-up check alone can miss a broken checkout
- **Error tracking** (Sentry or equivalent) wired into both the SSR site and any API/server functions — silent server errors in a payment or routing endpoint are the worst kind of bug to miss
- **Payment webhook monitoring** — alert if Stripe webhook processing fails or falls behind, since a missed webhook can leave a booking stuck in `pending` after the customer already paid
- **Synthetic checks** on critical flows (can a test booking be created end-to-end right now) rather than relying solely on user-reported issues

## Backups

- Automated daily database backups at minimum, more frequently once real transaction volume exists
- Periodically test restoring from a backup — an untested backup is not a reliable backup

## Secrets

- Managed via the hosting platform's environment variable/secrets system, never committed (see `08-security.md`)
- Distinct keys per environment; rotate credentials if a key is ever accidentally exposed (e.g., committed and then removed — rotate, don't just delete the commit)

## Performance

- SSR site should keep fast Core Web Vitals given mobile-first, often-on-cellular users — audit bundle size and image optimization as real photography replaces stock placeholders (real photos are usually much heavier than the current placeholders; make sure they're served optimized/responsive)
- Route optimization jobs are CPU-heavier than typical page requests — make sure they're isolated (background job, not blocking) so a big optimization run never slows down someone browsing the site

## Load testing

- Before peak season (spring/summer weekends), load test the booking/checkout flow specifically — this is a seasonal business with real traffic spikes, unlike most steady-state web apps.
