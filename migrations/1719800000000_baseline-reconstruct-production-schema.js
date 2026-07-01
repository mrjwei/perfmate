/**
 * Baseline migration: codifies the schema as it actually exists in production today.
 *
 * The `users` table and the `records.userid` column were created manually at some
 * point and were never captured in scripts/seed.js or any other tracked source.
 * This migration reconstructs that reality so future schema changes have a known
 * starting point. All statements are idempotent (IF NOT EXISTS) so this is safe
 * to run against the existing production database as well as a fresh one.
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createExtension("uuid-ossp", { ifNotExists: true })

  pgm.createTable(
    "users",
    {
      id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("uuid_generate_v4()"),
      },
      name: { type: "varchar", notNull: true },
      email: { type: "varchar", notNull: true, unique: true },
      password: { type: "varchar", notNull: true },
      hourlywages: { type: "numeric" },
      currency: { type: "varchar" },
      taxincluded: { type: "boolean" },
    },
    { ifNotExists: true }
  )

  pgm.createTable(
    "records",
    {
      id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("uuid_generate_v4()"),
      },
      date: { type: "date", notNull: true },
      starttime: { type: "time", notNull: true },
      endtime: { type: "time" },
    },
    { ifNotExists: true }
  )

  // userid was added to records out-of-band in production; codify it here.
  pgm.addColumn(
    "records",
    {
      userid: {
        type: "uuid",
        references: "users",
        onDelete: "CASCADE",
      },
    },
    { ifNotExists: true }
  )

  pgm.createTable(
    "breaks",
    {
      id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("uuid_generate_v4()"),
      },
      recordid: {
        type: "uuid",
        references: "records",
        onDelete: "CASCADE",
      },
      starttime: { type: "time", notNull: true },
      endtime: { type: "time" },
    },
    { ifNotExists: true }
  )

  // Backs the WHERE userid = $1 AND TO_CHAR(date, 'YYYY-MM') = $2 queries used
  // throughout app/lib/api.ts.
  pgm.createIndex("records", ["userid", "date"], { ifNotExists: true })
  pgm.createIndex("breaks", ["recordid"], { ifNotExists: true })
}

exports.down = (pgm) => {
  pgm.dropTable("breaks", { ifExists: true })
  pgm.dropColumn("records", "userid", { ifExists: true })
  pgm.dropTable("records", { ifExists: true })
  pgm.dropTable("users", { ifExists: true })
}
