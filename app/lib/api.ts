import {unstable_noStore as noStore} from 'next/cache'
import {sql} from '@/app/lib/db'
import { getFormattedTimeString } from "@/app/lib/helpers"
import { IBreak, IUserPlan, IWorkspace, TWeekday } from "@/app/lib/types"

// Shapes of the raw rows @vercel/postgres returns, before mapping to the
// app's I* types (columns are snake_case/Date-typed as Postgres returns them).
type TBreakRow = {
  [column: string]: any
  id: string
  recordid: string
  starttime: Date | string
  endtime: Date | string | null
}

type TRecordRow = {
  [column: string]: any
  id: string
  userid: string
  workspace_id: string
  // Registered as a raw 'YYYY-MM-DD' string in db.ts, not parsed to a Date.
  date: string
  starttime: Date | string
  endtime: Date | string | null
}

type TUserRow = {
  [column: string]: any
  id: string
  name: string
  email: string
}

type TUserAuthRow = TUserRow & {
  password: string
}

type TWorkspaceRow = {
  [column: string]: any
  id: string
  userid: string
  name: string
  hourly_wage: number | string
  currency: string
  tax_included: boolean
  tax_rate: number | string
  archived: boolean
  schedule: (number | null)[] | null
  timezone: string
  tax_country: string
}

const mapBreakRow = (b: TBreakRow, recordId: string): IBreak => ({
  id: b.id,
  recordId,
  starttime: getFormattedTimeString(b.starttime),
  endtime: b.endtime ? getFormattedTimeString(b.endtime) : null,
})

const mapRecordRow = (record: TRecordRow, breaks: IBreak[]) => ({
  id: record.id,
  userid: record.userid,
  workspaceid: record.workspace_id,
  date: record.date,
  starttime: getFormattedTimeString(record.starttime),
  breaks,
  endtime: record.endtime ? getFormattedTimeString(record.endtime) : null,
})

// Fetches breaks for a set of records in a single query, keyed by recordid,
// instead of one query per record (see [[db_schema_reality]] / Phase 2).
const fetchBreaksByRecordIds = async (recordIds: string[]) => {
  if (recordIds.length === 0) {
    return new Map<string, TBreakRow[]>()
  }
  const data = await sql.query<TBreakRow>(
    `SELECT * FROM breaks WHERE recordid = ANY($1::uuid[]) ORDER BY starttime ASC;`,
    [recordIds]
  )
  const byRecordId = new Map<string, TBreakRow[]>()
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
    const data = await sql<TRecordRow>`
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

export const fetchPaginatedRecords = async (workspaceId: string, month: string) => {
  noStore()
  try {
    const data = await sql<TRecordRow>`
      SELECT * FROM records
      WHERE workspace_id = ${workspaceId}
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

export const fetchRecordsByWorkspaceIdAndYear = async (workspaceId: string, year: string) => {
  noStore()
  try {
    const data = await sql<TRecordRow>`
      SELECT * FROM records
      WHERE workspace_id = ${workspaceId}
      AND TO_CHAR(date, 'YYYY') = ${year}
      ORDER BY date ASC;
    `
    const breaksByRecordId = await fetchBreaksByRecordIds(data.rows.map((r) => r.id))
    return data.rows.map((record) =>
      mapRecordRow(record, (breaksByRecordId.get(record.id) ?? []).map((b) => mapBreakRow(b, record.id)))
    )
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch records for year.');
  }
}

export const fetchRecordsToNotify = async (userId: string) => {
  noStore()
  try {
    // "Not today" is evaluated per-workspace since each workspace can have its own
    // business timezone (e.g. working for companies in different countries).
    const data = await sql<TRecordRow>`
      SELECT r.* FROM records r
      JOIN workspaces t ON t.id = r.workspace_id
      WHERE r.userid = ${userId}
        AND r.date != (now() AT TIME ZONE t.timezone)::date
        AND r.endtime IS NULL;
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
    const data = await sql<TBreakRow>`
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

export const fetchLastRecord = async (workspaceId: string) => {
  noStore()
  try {
    const data = await sql<TRecordRow>`
      SELECT * FROM records
      WHERE workspace_id = ${workspaceId}
      ORDER BY date DESC
      LIMIT 1;
    `
    const record = data.rows[0]

    if (!record) {
      return null
    }
    const breaks = await fetchBreaksByRecordId(record.id)

    return mapRecordRow(record, breaks.map((b) => mapBreakRow(b, record.id)))
  } catch {
    throw new Error('Failed to fetch last record.');
  }
}

export const fetchUserByEmail = async (email: string) => {
  noStore()
  try {
    const data = await sql<TUserRow>`
      SELECT id, name, email
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `
    return data.rows[0] ?? null
  } catch {
    throw new Error('Failed to get user');
  }
}

export const fetchUserAuthByEmail = async (email: string) => {
  noStore()
  try {
    const data = await sql<TUserAuthRow>`
      SELECT id, name, email, password
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `
    return data.rows[0] ?? null
  } catch {
    throw new Error('Failed to get user for auth');
  }
}

type TUserPlanRow = {
  [column: string]: any
  plan: string
  plan_status: string | null
  current_period_end: Date | string | null
  stripe_customer_id: string | null
}

export const fetchUserPlanInfo = async (userId: string): Promise<IUserPlan | null> => {
  noStore()
  try {
    const data = await sql<TUserPlanRow>`
      SELECT plan, plan_status, current_period_end, stripe_customer_id
      FROM users
      WHERE id = ${userId}
      LIMIT 1;
    `
    const row = data.rows[0]
    if (!row) {
      return null
    }
    return {
      plan: row.plan === "pro" ? "pro" : "free",
      planStatus: row.plan_status,
      currentPeriodEnd: row.current_period_end ? String(row.current_period_end) : null,
      stripeCustomerId: row.stripe_customer_id,
    }
  } catch {
    throw new Error('Failed to get user plan info');
  }
}

export const fetchUserIdByStripeCustomerId = async (stripeCustomerId: string) => {
  noStore()
  try {
    const data = await sql<{ id: string }>`
      SELECT id FROM users WHERE stripe_customer_id = ${stripeCustomerId} LIMIT 1;
    `
    return data.rows[0]?.id ?? null
  } catch {
    throw new Error('Failed to get user by Stripe customer id');
  }
}

const mapWorkspaceRow = (row: TWorkspaceRow): IWorkspace => ({
  id: row.id,
  userid: row.userid,
  name: row.name,
  hourlywage: Number(row.hourly_wage),
  currency: row.currency,
  taxincluded: row.tax_included,
  taxrate: Number(row.tax_rate),
  archived: row.archived,
  schedule: (row.schedule ?? []).filter((w): w is TWeekday => w !== null),
  timezone: row.timezone,
  taxcountry: row.tax_country,
})

export const fetchWorkspacesByUserId = async (userId: string) => {
  noStore()
  try {
    const data = await sql<TWorkspaceRow>`
      SELECT t.*, array_agg(ts.weekday) AS schedule
      FROM workspaces t
      LEFT JOIN workspace_schedules ts ON ts.workspace_id = t.id
      WHERE t.userid = ${userId}
      GROUP BY t.id
      ORDER BY t.archived ASC, t.created_at ASC;
    `
    return data.rows.map(mapWorkspaceRow)
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw new Error('Failed to fetch workspaces.');
  }
}

export const fetchWorkspaceById = async (id: string) => {
  noStore()
  try {
    const data = await sql<TWorkspaceRow>`
      SELECT t.*, array_agg(ts.weekday) AS schedule
      FROM workspaces t
      LEFT JOIN workspace_schedules ts ON ts.workspace_id = t.id
      WHERE t.id = ${id}
      GROUP BY t.id;
    `
    const row = data.rows[0]
    return row ? mapWorkspaceRow(row) : null
  } catch (error) {
    console.error(`Database error: ${error}`);
    return null
  }
}
