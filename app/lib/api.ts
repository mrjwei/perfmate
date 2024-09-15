import {unstable_noStore as noStore} from 'next/cache'
import {sql} from '@vercel/postgres'
import { getFormattedDateString, getFormattedTimeString } from "./helpers"

export const fetchRecordById = async (id: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE id = ${id};
    `
    const record = data.rows[0]
    const breaks = await fetchBreaksByRecordId(record.id)

    return {
      id: record.id,
      userid: record.userid,
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

export const fetchPaginatedRecords = async (userId: string, month: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE userid = ${userId}
      AND TO_CHAR(date, 'YYYY-MM') = ${month}
      ORDER BY date ASC;
    `
    const recordsWithBreaks = await Promise.all(data.rows.map(async record => {
      const breaks = await fetchBreaksByRecordId(record.id)
      return {
        id: record.id,
        userid: record.userid,
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

export const fetchRecordsToNotify = async (userId: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE userid = ${userId} AND date != ${getFormattedDateString(new Date())} AND endtime IS NULL;
    `
    const recordsWithBreaks = await Promise.all(data.rows.map(async record => {
      const breaks = await fetchBreaksByRecordId(record.id)
      return {
        id: record.id,
        userid: record.userid,
        date: getFormattedDateString(record.date),
        starttime: getFormattedTimeString(record.starttime),
        breaks: breaks.filter(b => !b.endtime).map(b => ({
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

export const fetchLastRecord = async (userId: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM records
      WHERE userid = ${userId}
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
      userid: record.userid,
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

export const fetchUserByEmail = async (email: string) => {
  noStore()
  try {
    const data = await sql`
      SELECT * FROM users WHERE email = ${email};
    `
    return data.rows[0]
  } catch (error) {
    throw new Error('Failed to get user');
  }
}
