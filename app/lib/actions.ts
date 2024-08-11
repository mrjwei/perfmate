'use server'

import {sql} from '@vercel/postgres'
import {z} from 'zod'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {
  getFormattedDateString,
  getFormattedTimeString,
  zip
} from "@/app/lib/helpers"
import { fetchRecordById } from "@/app/lib/api"

const FormSchema = z.object({
  id: z.string(),
  date: z.string(),
  starttime: z.string(),
  breakIds: z.array(z.string()),
  breakBeginTimes: z.array(z.string()),
  breakEndTimes: z.array(z.string().nullable()),
  endtime: z.string().nullable()
})

const UpdateRecordSchema = FormSchema.omit({id: true})

export async function updateRecord(id: string, month: string | null, formData: FormData) {
  const validatedFields = UpdateRecordSchema.safeParse({
    date: formData.get('date'),
    starttime: formData.get('starttime'),
    breakIds: formData.getAll('breakId'),
    breakBeginTimes: formData.getAll('breakBeginTime'),
    breakEndTimes: formData.getAll('breakEndTime'),
    endtime: formData.get('endtime'),
  })
  if (!validatedFields.success) {
    return {
      message: 'Failed to update record',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }
  let {date, starttime, breakIds, breakBeginTimes, breakEndTimes, endtime} = validatedFields.data

  const breakTimes = zip(null, breakIds, breakBeginTimes, breakEndTimes)
  console.log(JSON.stringify(breakTimes))

  try {
    await sql`
      UPDATE records
      SET date=${date}, starttime=${starttime}, endtime=${endtime ? endtime : null}
      WHERE id=${id};
    `
    await Promise.all(breakTimes.map(data => sql`
      UPDATE breaks
      SET starttime=${data[1]}, endtime=${data[2]}
      WHERE id=${data[0]};
    `))
  } catch (error) {
    return {
      message: 'Database error: failed to update record',
    }
  }
  revalidatePath('/records')
  if (month) {
    redirect(`/records?month=${month}&edited=${id}`)
  } else {
    redirect(`/records?edited=${id}`)
  }
}

export async function updateRecordEndTime(endtime: string, id: string) {
  try {
    await sql`
      UPDATE records
      SET endtime=${endtime}
      WHERE id=${id};
    `
  } catch (error) {
    return {
      message: 'Database error: failed to update endtime of record',
    }
  }
  revalidatePath('/')
  redirect('/')
}

export async function createRecord(data: {date: string, starttime: string}) {
  const {date, starttime} = data

  try {
    await sql`
      INSERT INTO records (date, starttime)
      VALUES (${date}, ${starttime});
    `
    revalidatePath('/')
    redirect('/')
  } catch (error) {
    return {
      message: 'Database error: failed to create record',
    }
  }
}

export async function createFullRecord(formData: FormData) {
  redirect('/records')
}

export async function createBreak(starttime: string, recordId: string) {
  try {
    await sql`
      INSERT INTO breaks (recordId, starttime)
      VALUES (${recordId}, ${starttime});
    `
  } catch (error) {
    return {
      message: 'Database error: failed to create break',
    }
  }
  revalidatePath('/')
  revalidatePath('/records')
  redirect('/')
}

export async function updateBreakEndTime(endtime: string, recordId: string) {
  const record = await fetchRecordById(recordId)
  const targetBreak = record.breaks.find(b => !b.endtime)
  if (!targetBreak) {
    return
  }

  try {
    await sql`
      UPDATE breaks
      SET endtime=${endtime}
      WHERE id=${targetBreak.id};
    `
  } catch (error) {
    return {
      message: 'Database error: failed to update endtime of break',
    }
  }
  revalidatePath('/')
  redirect('/')
}

