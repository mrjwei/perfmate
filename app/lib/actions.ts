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

const FormSchema = z.object({
  id: z.string(),
  date: z.string(),
  starttime: z.string(),
  breakBeginTimes: z.array(z.string()),
  breakEndTimes: z.array(z.string()),
  endtime: z.string()
})

const UpdateRecordSchema = FormSchema.omit({id: true})

export async function updateRecord(id: string, formData: FormData) {
  const validatedFields = UpdateRecordSchema.safeParse({
    date: formData.get('date'),
    starttime: formData.get('starttime'),
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
  const {date, starttime, breakBeginTimes, breakEndTimes, endtime} = validatedFields.data
  const breakTimes = zip(null, breakBeginTimes, breakEndTimes)

  try {
    await sql`
      UPDATE records
      SET date=${date}, starttime=${starttime}, endtime=${endtime}
      WHERE id=${id};
    `
    await Promise.all(breakTimes.map(timePair => sql`
      UPDATE breaks
      SET starttime=${timePair[0]}, endtime=${timePair[1]}
      WHERE recordId=${id};
    `))
  } catch (error) {
    return {
      message: 'Database error: failed to update record',
    }
  }
  revalidatePath('/records')
  redirect('/records')
}

export async function createRecord() {
  const d = new Date()
  const date = getFormattedDateString(d)
  const starttime = getFormattedTimeString(d)
  const endtime = null

  try {
    await sql`
      INSERT INTO records (date, starttime, endtime)
      VALUES (${date}, ${starttime}, ${endtime});
    `
  } catch (error) {
    return {
      message: 'Database error: failed to create record',
    }
  }
  revalidatePath('/')
  revalidatePath('/records')
  redirect('/')
}

