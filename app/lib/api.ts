import {unstable_noStore as noStore} from 'next/cache'
import {sql} from '@vercel/postgres'
import { dateToStr, getFormattedTimeString } from "@/app/lib/helpers"
import { IBreak, IThread, TWeekday } from "@/app/lib/types"

const mapBreakRow = (b: any, recordId: string): IBreak => ({
  id: b.id,
  recordId,
  starttime: getFormattedTimeString(b.starttime),
  endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
})

const mapRecordRow = (record: any, breaks: IBreak[]) => ({
  id: record.id,
  userid: record.userid,
  threadid: record.thread_id,
  date: dateToStr(record.date),
  starttime: getFormattedTimeString(record.starttime),
  breaks,
  endtime: record.endtime ? getFormattedTimeString(record.endtime) : null,
})

// Fetches breaks for a set of records in a single query, keyed by recordid,
// instead of one query per record (see [[db_schema_reality]] / Phase 2).
const fetchBreaksByRecordIds = async (recordIds: string[]) => {
  if (recordIds.length === 0) {
    return new Map<string, any[]>()
  }
  const data = await sql.query(
    `SELECT * FROM breaks WHERE recordid = ANY($1::uuid[]) ORDER BY starttime ASC;`,
    [recordIds]
  )
  const byRecordId = new Map<string, any[]>()
  for (const row of data.rows) {
    const list = byRecordId.get(row.recordid) ?? []
    list.push(row)
    byRecordId.set(row.recordid, list)
  }
  return byRecordId
}

export const fetchRecordById = async (id: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE id = ${id};
    `
    const record = data.rows[0]
    const breaks = await fetchBreaksByRecordId(record.id)

    return mapRecordRow(record, breaks.map((b) => mapBreakRow(b, record.id)))
  } catch (error) {
    console.error(`Database error: ${error}`);
    return null
  }
}

export const fetchPaginatedRecords = async (threadId: string, month: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE thread_id = ${threadId}
      AND TO_CHAR(date, 'YYYY-MM') = ${month}
      ORDER BY date ASC;
    `
    const breaksByRecordId = await fetchBreaksByRecordIds(data.rows.map((r) => r.id))
    return data.rows.map((record) =>
      mapRecordRow(record, (breaksByRecordId.get(record.id) ?? []).map((b) => mapBreakRow(b, record.id)))
    )
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch paginated records.');
  }
}

export const fetchRecordsToNotify = async (userId: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE userid = ${userId} AND date != ${dateToStr(new Date())} AND endtime IS NULL;
    `
    const breaksByRecordId = await fetchBreaksByRecordIds(data.rows.map((r) => r.id))
    return data.rows.map((record) => {
      const breaks = (breaksByRecordId.get(record.id) ?? []).filter((b) => !b.endtime)
      return mapRecordRow(record, breaks.map((b) => mapBreakRow(b, record.id)))
    })
  } catch (error) {
    console.error(`Database error: ${error}`);
    return null
  }
}

export const fetchBreaksByRecordId = async (recordId: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM breaks
      WHERE breaks.recordId = ${recordId}
      ORDER BY starttime ASC;
    `
    return data.rows
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch breaks by recordId.');
  }
}

export const fetchLastRecord = async (threadId: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE thread_id = ${threadId}
      ORDER BY date DESC
      LIMIT 1;
    `
    const record = data.rows[0]

    if (!record) {
      return null
    }
    const breaks = await fetchBreaksByRecordId(record.id)

    return mapRecordRow(record, breaks.map((b) => mapBreakRow(b, record.id)))
  } catch (error) {
    throw new Error('Failed to fetch last record.');
  }
}

export const fetchUserByEmail = async (email: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT id, name, email
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `
    return data.rows[0] ?? null
  } catch (error) {
    throw new Error('Failed to get user');
  }
}

export const fetchUserAuthByEmail = async (email: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT id, name, email, password
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `
    return data.rows[0] ?? null
  } catch (error) {
    throw new Error('Failed to get user for auth');
  }
}

const mapThreadRow = (row: any): IThread => ({
  id: row.id,
  userid: row.userid,
  name: row.name,
  hourlywage: Number(row.hourly_wage),
  currency: row.currency,
  taxincluded: row.tax_included,
  taxrate: Number(row.tax_rate),
  archived: row.archived,
  schedule: (row.schedule ?? []).filter((w: number | null) => w !== null) as TWeekday[],
})

export const fetchThreadsByUserId = async (userId: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT t.*, array_agg(ts.weekday) AS schedule
      FROM threads t
      LEFT JOIN thread_schedules ts ON ts.thread_id = t.id
      WHERE t.userid = ${userId}
      GROUP BY t.id
      ORDER BY t.archived ASC, t.created_at ASC;
    `
    return data.rows.map(mapThreadRow)
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch threads.');
  }
}

export const fetchThreadById = async (id: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT t.*, array_agg(ts.weekday) AS schedule
      FROM threads t
      LEFT JOIN thread_schedules ts ON ts.thread_id = t.id
      WHERE t.id = ${id}
      GROUP BY t.id;
    `
    const row = data.rows[0]
    return row ? mapThreadRow(row) : null
  } catch (error) {
    console.error(`Database error: ${error}`);
    return null
  }
}
