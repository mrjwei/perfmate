const {sql} = require('@vercel/postgres')
const {records, breaks} = require('../app/lib/data.js')

async function seedBreaks() {
  try {
    await sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `
    const res = await sql`
      CREATE TABLE IF NOT EXISTS breaks (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        recordId UUID REFERENCES records(id) ON DELETE CASCADE,
        starttime TIME NOT NULL,
        endtime TIME
      );
    `
    console.log('created breaks table')

    const insertedBreaks = Promise.all(
      breaks.map(b => sql`
        INSERT INTO breaks (recordId, starttime, endtime)
        VALUES (${b.recordId}, ${b.starttime}, ${b.endtime})
        ON CONFLICT (id) DO NOTHING;
      `)
    )
    console.log('seeded breaks')

    return {
      res,
      breaks: insertedBreaks
    }
  } catch (error) {
    console.error(`Error seeding breaks: ${error}`)
    throw error
  }
}

async function seedRecords() {
  try {
    await sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `
    const res = await sql`
      CREATE TABLE IF NOT EXISTS records (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        date DATE NOT NULL,
        starttime TIME NOT NULL,
        endtime TIME
      )
    `
    console.log('created records table')

    const insertedRecords = Promise.all(
      records.map(r => sql`
        INSERT INTO records (id, date, starttime, endtime)
        VALUES (${r.id}, ${r.date}, ${r.starttime}, ${r.endtime})
        ON CONFLICT (id) DO NOTHING;
      `)
    )
    console.log('seeded records')

    return {
      res,
      breaks: insertedRecords
    }
  } catch (error) {

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
