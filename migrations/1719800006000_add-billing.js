/**
 * Billing/subscription infrastructure (PLAN.md Phase 10). Per-user, not
 * per-workspace — plan governs how many workspaces a user can have and
 * whether they can use tax export (Phase 11), independent of any one
 * workspace's own settings.
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addColumn("users", {
    stripe_customer_id: { type: "text", unique: true },
    plan: { type: "varchar", notNull: true, default: "free" },
    plan_status: { type: "varchar" },
    current_period_end: { type: "timestamp" },
  })
}

exports.down = (pgm) => {
  pgm.dropColumn("users", ["stripe_customer_id", "plan", "plan_status", "current_period_end"])
}
