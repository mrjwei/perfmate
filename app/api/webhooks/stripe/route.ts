import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sql } from "@/app/lib/db"
import { stripe } from "@/app/lib/stripe"
import { fetchUserIdByStripeCustomerId } from "@/app/lib/api"

const setPlan = async (
  customerId: string,
  fields: { plan: "free" | "pro"; planStatus: string | null; currentPeriodEnd: string | null }
) => {
  const userId = await fetchUserIdByStripeCustomerId(customerId)
  if (!userId) {
    console.error(`[stripe webhook] no user found for Stripe customer ${customerId}`)
    return
  }
  await sql`
    UPDATE users
    SET plan = ${fields.plan}, plan_status = ${fields.planStatus}, current_period_end = ${fields.currentPeriodEnd}
    WHERE id = ${userId};
  `
}

// This app only ever creates single-item subscriptions (one Pro price per
// checkout), so the first item's period covers the whole subscription —
// current_period_end lives on the subscription item, not the subscription
// itself, as of this Stripe API version.
const periodEndToIso = (subscription: Stripe.Subscription) => {
  const periodEnd = subscription.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null
}

export async function POST(request: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe isn't configured" }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error("[stripe webhook] signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      if (typeof session.customer === "string" && typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        await setPlan(session.customer, {
          plan: "pro",
          planStatus: subscription.status,
          currentPeriodEnd: periodEndToIso(subscription),
        })
      }
      break
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object
      if (typeof subscription.customer === "string") {
        await setPlan(subscription.customer, {
          plan: subscription.status === "active" || subscription.status === "trialing" ? "pro" : "free",
          planStatus: subscription.status,
          currentPeriodEnd: periodEndToIso(subscription),
        })
      }
      break
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object
      if (typeof subscription.customer === "string") {
        await setPlan(subscription.customer, { plan: "free", planStatus: "canceled", currentPeriodEnd: null })
      }
      break
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object
      if (typeof invoice.customer === "string") {
        const userId = await fetchUserIdByStripeCustomerId(invoice.customer)
        if (userId) {
          await sql`UPDATE users SET plan_status = 'past_due' WHERE id = ${userId};`
        }
      }
      break
    }
    default:
      // Unhandled event types are expected — Stripe sends far more event
      // types than this app acts on; ignoring them is the correct default.
      break
  }

  return NextResponse.json({ received: true })
}
