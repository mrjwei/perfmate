/**
 * Wage/currency/tax settings now live per-thread (see
 * 1719800001000_add-threads.js, which already copied every user's values
 * into their default thread). These columns on `users` are dead weight.
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.dropColumn("users", ["hourlywages", "currency", "taxincluded"])
}

exports.down = (pgm) => {
  pgm.addColumn("users", {
    hourlywages: { type: "numeric" },
    currency: { type: "varchar" },
    taxincluded: { type: "boolean" },
  })
}
