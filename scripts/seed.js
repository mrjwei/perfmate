// Inserts local dev fixture data. Table creation now lives in /migrations
// (run `npm run migrate:up` first) — this script only seeds rows.
const {sql} = require('@vercel/postgres')
const {records, breaks} = require('../app/lib/data.js')

async function seedRecords() {
  try {
    const insertedRecords = await Promise.all(
      records.map(r => sql`
        INSERT INTO records (id, date, starttime, endtime)
        VALUES (${r.id}, ${r.date}, ${r.starttime}, ${r.endtime})
        ON CONFLICT (id) DO NOTHING;
      `)
    )
    console.log('seeded records')
    return insertedRecords
  } catch (error) {
    console.error(`Error seeding records: ${error}`)
    throw error
  }
}

async function seedBreaks() {
  try {
    const insertedBreaks = await Promise.all(
      breaks.map(b => sql`
        INSERT INTO breaks (id, recordId, starttime, endtime)
        VALUES (${b.id}, ${b.recordId}, ${b.starttime}, ${b.endtime})
        ON CONFLICT (id) DO NOTHING;
      `)
    )
    console.log('seeded breaks')
    return insertedBreaks
  } catch (error) {
    console.error(`Error seeding breaks: ${error}`)
    throw error
  }
}

async function main() {
  await seedRecords()
  await seedBreaks()
}

main()
  .catch(error => {
    console.error(`Failed to seed db: ${error}`)
  })
