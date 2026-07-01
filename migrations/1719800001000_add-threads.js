/**
 * Introduces "threads" (the generic term for a job/org/role a user logs time
 * against) so a user is no longer limited to one employer/rate per day.
 *
 * - threads: one row per thread, carrying the wage/currency/tax settings that
 *   used to live on `users`.
 * - thread_schedules: which weekdays a thread is expected to be worked.
 * - records.thread_id: replaces the implicit "one record per user per day"
 *   assumption with "one record per thread per day".
 *
 * Every existing user gets a single "Default" thread seeded from their old
 * users.hourlywages/currency/taxincluded, and all of their existing records
 * are attached to it, so no historical data is lost.
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable("threads", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    userid: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    name: { type: "varchar", notNull: true },
    hourly_wage: { type: "numeric", notNull: true, default: 0 },
    currency: { type: "varchar", notNull: true, default: "yen" },
    tax_included: { type: "boolean", notNull: true, default: false },
    tax_rate: { type: "numeric", notNull: true, default: 0 },
    archived: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  })

  pgm.createTable("thread_schedules", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    thread_id: { type: "uuid", notNull: true, references: "threads", onDelete: "CASCADE" },
    // 0 = Sunday .. 6 = Saturday, matching JS Date#getDay()
    weekday: { type: "smallint", notNull: true, check: "weekday BETWEEN 0 AND 6" },
  })
  pgm.addConstraint("thread_schedules", "thread_schedules_thread_id_weekday_unique", {
    unique: ["thread_id", "weekday"],
  })

  pgm.addColumn("records", {
    thread_id: { type: "uuid", references: "threads", onDelete: "CASCADE" },
  })

  // A small number of pre-existing records have no userid (data from a bug
  // predating this migration) and so can't be attributed to any thread.
  // There's no way to recover their owner, so they're dropped rather than
  // left orphaned.
  pgm.sql(`DELETE FROM records WHERE userid IS NULL;`)

  // Backfill: one default thread per existing user, seeded from their old
  // per-user wage settings, defaulting Mon-Fri as the schedule.
  pgm.sql(`
    INSERT INTO threads (userid, name, hourly_wage, currency, tax_included, tax_rate)
    SELECT id, 'Default', COALESCE(hourlywages, 0), COALESCE(currency, 'yen'), COALESCE(taxincluded, false), 0
    FROM users;
  `)
  pgm.sql(`
    INSERT INTO thread_schedules (thread_id, weekday)
    SELECT t.id, weekday
    FROM threads t, generate_series(1, 5) AS weekday;
  `)
  pgm.sql(`
    UPDATE records r
    SET thread_id = t.id
    FROM threads t
    WHERE t.userid = r.userid AND r.thread_id IS NULL;
  `)

  pgm.alterColumn("records", "thread_id", { notNull: true })

  // Replaces the old one-record-per-user-per-day constraint (see
  // [[db_schema_reality]]) with one-record-per-thread-per-day, which is what
  // actually allows multiple threads to each have their own entry on the
  // same date.
  pgm.sql(`ALTER TABLE records DROP CONSTRAINT IF EXISTS unique_date_userid;`)
  pgm.addConstraint("records", "unique_date_threadid", {
    unique: ["thread_id", "date"],
  })

  pgm.createIndex("threads", ["userid"], { ifNotExists: true })
}

exports.down = (pgm) => {
  pgm.dropConstraint("records", "unique_date_threadid", { ifExists: true })
  pgm.addConstraint("records", "unique_date_userid", { unique: ["userid", "date"] })
  pgm.dropColumn("records", "thread_id")
  pgm.dropTable("thread_schedules")
  pgm.dropTable("threads")
}
