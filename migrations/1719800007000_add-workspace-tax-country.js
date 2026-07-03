/**
 * Seam for later countries (PLAN.md Phase 11) — every workspace is JP for
 * now, but this is where a second country's tax logic would key off of,
 * consistent with the existing per-workspace currency/tax_rate/tax_included
 * model rather than a global app setting.
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addColumn("workspaces", {
    tax_country: { type: "text", notNull: true, default: "JP" },
  })
}

exports.down = (pgm) => {
  pgm.dropColumn("workspaces", "tax_country")
}
