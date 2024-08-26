import {unstable_noStore as noStore} from 'next/cache'
import {sql} from '@vercel/postgres'
import { getFormattedDateString, getFormattedTimeString } from "./helpers"

export const fetchUniqueMonths = async () => {
  noStore()
  try {
    const data = await sql`
      SELECT DISTINCT TO_CHAR(date, 'YYYY-MM') AS month
      FROM records
      ORDER BY month;
    `
    return data.rows.map(r => r.month)
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to get number of pages.');
  }
}

export const fetchRecordById = async (id: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records WHERE id = ${id};
    `
    const record = data.rows[0]
    const breaks = await fetchBreaksByRecordId(record.id)

    return {
      id: record.id,
      date: getFormattedDateString(record.date),
      starttime: getFormattedTimeString(record.starttime),
      breaks: breaks.map(b => ({
        id: b.id,
        recordId: record.id,
        starttime: getFormattedTimeString(b.starttime),
        endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
      })),
      endtime: record.endtime ? getFormattedTimeString(record.endtime) : null
    }
  } catch (error) {
    console.error(`Database error: ${error}`);
    return null
  }
}

export const fetchRecordByDate = async (date: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records WHERE date = DATE(${date});
    `
    const record = data.rows[0]
    const breaks = await fetchBreaksByRecordId(record.id)

    return {
      id: record.id,
      date: getFormattedDateString(record.date),
      starttime: getFormattedTimeString(record.starttime),
      breaks: breaks.map(b => ({
        id: b.id,
        recordId: record.id,
        starttime: getFormattedTimeString(b.starttime),
        endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
      })),
      endtime: record.endtime ? getFormattedTimeString(record.endtime) : null
    }
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch record.');
  }
}

export const fetchRecords = async () => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      ORDER BY date DESC;
    `
    const recordsWithBreaks = await Promise.all(data.rows.map(async record => {
      const breaks = await fetchBreaksByRecordId(record.id)
      return {
        id: record.id,
        date: getFormattedDateString(record.date),
        starttime: getFormattedTimeString(record.starttime),
        breaks: breaks.map(b => ({
          id: b.id,
          recordId: record.id,
          starttime: getFormattedTimeString(b.starttime),
          endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
        })),
        endtime: record.endtime ? getFormattedTimeString(record.endtime) : null
      }
    }))
    return recordsWithBreaks
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch records.');
  }
}

export const fetchPaginatedRecords = async (month: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE TO_CHAR(date, 'YYYY-MM') = ${month}
      ORDER BY date ASC;
    `
    const recordsWithBreaks = await Promise.all(data.rows.map(async record => {
      const breaks = await fetchBreaksByRecordId(record.id)
      return {
        id: record.id,
        date: getFormattedDateString(record.date),
        starttime: getFormattedTimeString(record.starttime),
        breaks: breaks.map(b => ({
          id: b.id,
          recordId: record.id,
          starttime: getFormattedTimeString(b.starttime),
          endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
        })),
        endtime: record.endtime ? getFormattedTimeString(record.endtime) : null
      }
    }))
    return recordsWithBreaks
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch paginated records.');
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

export const fetchLastRecord = async () => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      ORDER BY date DESC
      LIMIT 1;
    `
    const record = data.rows[0]

    if (!record) {
      return null
    }
    const breaks = await fetchBreaksByRecordId(record.id)

    return {
      id: record.id,
      date: getFormattedDateString(record.date),
      starttime: getFormattedTimeString(record.starttime),
      breaks: breaks.map(b => ({
        id: b.id,
        recordId: record.id,
        starttime: getFormattedTimeString(b.starttime),
        endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
      })),
      endtime: record.endtime ? getFormattedTimeString(record.endtime) : null
    }
  } catch (error) {
    throw new Error('Failed to fetch last record.');
  }
}

export const fetchUser = async (id: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM users WHERE id = ${id};
    `
    return data.rows[0]
  } catch (error) {
    throw new Error('Failed to get user');
  }
}
