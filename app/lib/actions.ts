'use server'

import {z} from 'zod'
import axios from 'axios'
import {revalidatePath} from 'next/cache'
import {fetchOneRecord} from '@/app/lib/api'
import { IBreak } from "@/app/lib/types"
import { zip } from "@/app/lib/helpers"

const FormSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  breakBeginTimes: z.array(z.string()),
  breakEndTimes: z.array(z.string()),
  endTime: z.string()
})

const UpdateRecordSchema = FormSchema.omit({id: true})

export async function updateRecord(id: string, formData: FormData) {
  const record = await fetchOneRecord(id)
  const validatedFields = UpdateRecordSchema.safeParse({
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    breakBeginTimes: formData.getAll('breakBeginTime'),
    breakEndTimes: formData.getAll('breakEndTime'),
    endTime: formData.get('endTime'),
  })
  if (!validatedFields.success) {
    return {
      message: 'Failed to update record',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }
  const {date, startTime, breakBeginTimes, breakEndTimes, endTime} = validatedFields.data
  const breakTimes = zip('--:--', breakBeginTimes, breakEndTimes)
  axios.patch(`http://localhost:3000/records/${id}`, {
    date,
    startTime,
    breaks: record.breaks.map((b: IBreak, i: number) => ({
      ...b,
      startTime: breakTimes[i][0],
      endTime: breakTimes[i][1],
    })),
    endTime
  })
  revalidatePath('/records')
}

