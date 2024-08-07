import {unstable_noStore as noStore} from 'next/cache'
import {sql} from '@vercel/postgres'
import { getFormattedDateString, getFormattedTimeString } from "./helpers"

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
    const recordsWithBreaks = await Promise.all(data.rows.map(async r => {
      const breaks = await fetchBreaksByRecordId(r.id)
      return {
        id: r.id,
        date: getFormattedDateString(r.date),
        starttime: getFormattedTimeString(r.starttime),
        breaks: breaks.map(b => ({
          id: b.id,
          starttime: getFormattedTimeString(b.starttime),
          endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
        })),
        endtime: r.endtime ? getFormattedTimeString(r.endtime) : null
      }
    }))
    return recordsWithBreaks
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch records.');
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
    const breaks = await fetchBreaksByRecordId(record.id)

    return {
      id: record.id,
      date: getFormattedDateString(record.date),
      starttime: getFormattedTimeString(record.starttime),
      breaks: breaks.map(b => ({
        id: b.id,
        starttime: getFormattedTimeString(b.starttime),
        endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
      })),
      endtime: record.endtime ? getFormattedTimeString(record.endtime) : null
    }
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch last record.');
  }
}
