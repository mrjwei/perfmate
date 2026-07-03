import Stripe from "stripe"

// Unset in local/CI environments until a real Stripe account is wired up
// (PLAN.md Phase 13); callers must check `stripe` is non-null before use —
// there's no safe no-op for "create a checkout session" the way there is
// for email sending, so billing actions surface a clear error instead.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

// The Price ID for the single Pro plan (¥500–1000/mo per PLAN.md) — one
// plan for now, no tiers, so a single env var is enough.
export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID
