# Perfmate

A minimal work hour tracker designed especially for freelancers and small companies.

## Setup

```
npm install
cp .env.example .env
```

Fill in the Postgres variables in `.env` (see `.env.example`). `RESEND_API_KEY`
and the `STRIPE_*` variables are optional — email sending and billing are
disabled gracefully when they're unset (see `.env.example` for what each
one does).

```
npm run dev
```

## Testing and linting

```
npm run lint       # eslint .
npx tsc --noEmit
npx vitest run
npm run build
```

All four are run in CI (`.github/workflows/ci.yml`) on every push to `main`
and on every pull request.

## Database migrations

Migrations run via `node-pg-migrate` directly against the Postgres instance
configured in `.env` — there is no separate local/dev database, so schema
changes should be additive and applied deliberately.

```
npm run migrate:create -- some-migration-name
npm run migrate:up
```

## Stripe billing (local dev)

1. Create a Stripe account in test mode and grab the test-mode secret key
   from the Dashboard → set `STRIPE_SECRET_KEY`.
2. Create a Product with a recurring Price for the Pro plan → set
   `STRIPE_PRO_PRICE_ID` to that price's id.
3. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward
   webhook events to your local server:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   The CLI prints a webhook signing secret (`whsec_...`) — set that as
   `STRIPE_WEBHOOK_SECRET`.
4. In production (e.g. Vercel), add a webhook endpoint in the Stripe
   Dashboard pointing at `https://<your-domain>/api/webhooks/stripe`,
   subscribed to `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`, and
   `invoice.payment_failed` — then set that endpoint's signing secret as
   `STRIPE_WEBHOOK_SECRET` in the deployment's environment variables.

## Deployment

Set the same environment variables from `.env.example` in the Vercel
project's environment variable dashboard (Production/Preview/Development
as appropriate). `AUTH_SECRET` and the `POSTGRES_*` variables are required;
`RESEND_API_KEY` and the `STRIPE_*` variables are optional but should be set
before relying on password-reset emails or billing in production.
