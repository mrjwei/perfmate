/**
 * Admin/ops tooling (PLAN.md Phase 14) needs a way to gate a small internal
 * dashboard to trusted operators. There's no self-serve promotion flow —
 * promoting a user to admin is a manual `UPDATE users SET role='admin'`.
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addColumn("users", {
    role: { type: "text", notNull: true, default: "user" },
  })
}

exports.down = (pgm) => {
  pgm.dropColumn("users", "role")
}
