/**
 * Auth hardening (PLAN.md Phase 9): password reset and email verification.
 *
 * Tokens are stored as a SHA-256 hash of the random token, not the raw
 * value — the raw token only ever exists in the emailed link, so a DB leak
 * alone can't be used to reset a password or verify an address. Unlike user
 * passwords these don't need bcrypt's deliberate slowness: they're
 * high-entropy random values, not something an attacker can feasibly guess
 * and brute-force via the hash.
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addColumn("users", {
    email_verified_at: { type: "timestamp" },
  })

  pgm.createTable("password_reset_tokens", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    token_hash: { type: "text", notNull: true, unique: true },
    expires_at: { type: "timestamp", notNull: true },
    used_at: { type: "timestamp" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  })
  pgm.createIndex("password_reset_tokens", ["user_id"])

  pgm.createTable("email_verification_tokens", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    token_hash: { type: "text", notNull: true, unique: true },
    expires_at: { type: "timestamp", notNull: true },
    used_at: { type: "timestamp" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  })
  pgm.createIndex("email_verification_tokens", ["user_id"])
}

exports.down = (pgm) => {
  pgm.dropTable("email_verification_tokens")
  pgm.dropTable("password_reset_tokens")
  pgm.dropColumn("users", "email_verified_at")
}
