import { sql, types } from '@vercel/postgres'

// Postgres DATE columns (OID 1082) have no time-of-day or timezone component,
// but node-postgres's default parser still builds a JS Date at *local system
// midnight* and hands it back. Everything downstream then reformats that
// Date through an explicit target timezone (see helpers.ts's `formatter`),
// so the calendar date silently drifts by a day whenever the process's local
// system timezone differs from the display timezone — e.g. records.date
// shows one day earlier when run locally (UTC+10) than on Vercel (UTC).
// Returning the raw 'YYYY-MM-DD' string sidesteps the whole problem: a
// date-only value should never be parsed as a timezone-bearing instant.
types.setTypeParser(1082, (value: string) => value)

export { sql }
