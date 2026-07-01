/**
 * Timezone is a per-thread setting, not per-user: someone can work for
 * companies in different countries, each with its own business timezone
 * (affects what counts as "today" and the current time shown/recorded).
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addColumn("threads", {
    timezone: { type: "varchar", notNull: true, default: "Asia/Tokyo" },
  })
}

exports.down = (pgm) => {
  pgm.dropColumn("threads", "timezone")
}
