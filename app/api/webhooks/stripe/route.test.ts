import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const constructEvent = vi.fn()
const subscriptionsRetrieve = vi.fn()
const sqlMock = vi.fn()
const fetchUserIdByStripeCustomerId = vi.fn()

vi.mock("@/app/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent },
    subscriptions: { retrieve: subscriptionsRetrieve },
  },
}))

vi.mock("@/app/lib/db", () => ({
  sql: (...args: unknown[]) => sqlMock(...args),
}))

vi.mock("@/app/lib/api", () => ({
  fetchUserIdByStripeCustomerId: (...args: unknown[]) => fetchUserIdByStripeCustomerId(...args),
}))

const buildRequest = (body: string, signature: string | null = "test-signature") => {
  const headers = new Headers()
  if (signature) headers.set("stripe-signature", signature)
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers,
  })
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test"
    fetchUserIdByStripeCustomerId.mockResolvedValue("user-1")
  })

  it("returns 400 when the stripe-signature header is missing", async () => {
    const { POST } = await import("./route")
    const response = await POST(buildRequest("{}", null))
    expect(response.status).toBe(400)
    expect(constructEvent).not.toHaveBeenCalled()
  })

  it("returns 400 when signature verification fails", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature")
    })
    const { POST } = await import("./route")
    const response = await POST(buildRequest("{}"))
    expect(response.status).toBe(400)
  })

  it("upgrades the user to pro on checkout.session.completed", async () => {
    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { customer: "cus_1", subscription: "sub_1" } },
    })
    subscriptionsRetrieve.mockResolvedValue({
      status: "active",
      items: { data: [{ current_period_end: 1735689600 }] },
    })

    const { POST } = await import("./route")
    const response = await POST(buildRequest("{}"))

    expect(response.status).toBe(200)
    expect(fetchUserIdByStripeCustomerId).toHaveBeenCalledWith("cus_1")
    expect(sqlMock).toHaveBeenCalled()
    const [strings, ...values] = sqlMock.mock.calls[0]
    expect(strings.join("?")).toContain("UPDATE users")
    expect(values).toContain("pro")
    expect(values).toContain("active")
  })

  it("downgrades the user to free on customer.subscription.deleted", async () => {
    constructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { customer: "cus_1" } },
    })

    const { POST } = await import("./route")
    const response = await POST(buildRequest("{}"))

    expect(response.status).toBe(200)
    const [, ...values] = sqlMock.mock.calls[0]
    expect(values).toContain("free")
    expect(values).toContain("canceled")
  })

  it("marks plan_status past_due on invoice.payment_failed", async () => {
    constructEvent.mockReturnValue({
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_1" } },
    })

    const { POST } = await import("./route")
    const response = await POST(buildRequest("{}"))

    expect(response.status).toBe(200)
    const [strings] = sqlMock.mock.calls[0]
    expect(strings.join("?")).toContain("past_due")
  })

  it("ignores unhandled event types without touching the database", async () => {
    constructEvent.mockReturnValue({
      type: "customer.created",
      data: { object: {} },
    })

    const { POST } = await import("./route")
    const response = await POST(buildRequest("{}"))

    expect(response.status).toBe(200)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it("returns 503 when Stripe isn't configured", async () => {
    vi.resetModules()
    vi.doMock("@/app/lib/stripe", () => ({ stripe: null }))
    const { POST } = await import("./route")
    const response = await POST(buildRequest("{}"))
    expect(response.status).toBe(503)
  })
})
