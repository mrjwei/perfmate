"use server"

import { sql } from "@vercel/postgres"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  getTimeDifferneceInMins,
  zip,
} from "@/app/lib/helpers"
import { fetchRecordById } from "@/app/lib/api"
import {IBreak} from '@/app/lib/types'

const BaseFormObj = z.object({
  id: z.string().uuid(),
  date: z.string(),
  starttime: z.string(),
  existing_breakIds: z.array(z.string().uuid()),
  existing_breakStartTimes: z.array(z.string()),
  existing_breakEndTimes: z.array(z.string().nullable()),
  new_breakStartTimes: z.array(z.string()),
  new_breakEndTimes: z.array(z.string().nullable()),
  endtime: z.string().nullable(),
})

const TargetFormObj = z.object({
  id: z.string().uuid(),
  date: z.string().length(10, 'Date must not be empty and should be of yyyy-mm-dd format'),
  starttime: z.string().length(5, 'Start time must not be empty and should be of hh:mm format'),
  existingBreaks: z.array(z.tuple([z.string(), z.string({
    message: 'Break start time must not be empty and should be of hh:mm format'
  }).length(5).nullable(), z.string({
    message: 'Break end time should be of hh:mm format'
  }).length(5).nullable()])).optional(),
  newBreaks: z.array(z.tuple([z.string().length(5, {
    message: 'Break start time must not be empty and should be of hh:mm format'
  }), z.string().length(5, {
    message: 'Break end time should be of hh:mm format'
  }).nullable()])).optional(),
  endtime: z.string().length(5, 'End time should be of hh:mm format').nullable(),
})

const UpdateFormObj = BaseFormObj.omit({
  id: true
})

const UpdateFormSchema = z.preprocess((data: unknown) => {
  const typedData = data as z.infer<typeof UpdateFormObj>
  return {
    date: typedData.date,
    starttime: typedData.starttime,
    existingBreaks: zip(
      null,
      typedData.existing_breakIds,
      typedData.existing_breakStartTimes,
      typedData.existing_breakEndTimes
    ),
    newBreaks: zip(
      null,
      typedData.new_breakStartTimes,
      typedData.new_breakEndTimes
    ).filter(b => !(!b[0] && !b[1])),
    endtime: typedData.endtime === '' ? null : typedData.endtime
  }
}, TargetFormObj.omit({id: true})).refine(data => {
  if (data.starttime && data.endtime) {
    return getTimeDifferneceInMins(data.starttime, data.endtime) >= 0
  }
  return true
}, 'Start time must be earlier than end time').superRefine((data, ctx) => {
  if (data.existingBreaks) {
    const index = data.existingBreaks.findIndex(b => (!b[1] && b[2]) || (b[1] && b[2] && getTimeDifferneceInMins(b[1], b[2]) < 0))
    if (index !== -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please check existing break start time and end time',
        path: ['existingBreaks', index, 0]
      });
    }
    }
  }
).superRefine((data, ctx) => {
  if (data.newBreaks) {
    const index = data.newBreaks.findIndex(b => (!b[0] && b[1]) || (b[0] && b[1] && getTimeDifferneceInMins(b[0], b[1]) < 0))
    if (index !== -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please check new break start time and end time',
        path: ['newBreaks', index, 0]
      });
    }
    }
  }
)

const CreateFormObj = BaseFormObj.omit({
  id: true,
  existing_breakIds: true,
  existing_breakStartTimes: true,
  existing_breakEndTimes: true,
})

const CreateFormSchema = z.preprocess((data: unknown) => {
  const typedData = data as z.infer<typeof CreateFormObj>
  return {
    date: typedData.date,
    starttime: typedData.starttime,
    newBreaks: zip(
      null,
      typedData.new_breakStartTimes,
      typedData.new_breakEndTimes
    ).filter(b => !(!b[0] && !b[1])),
    endtime: typedData.endtime === '' ? null : typedData.endtime
  }
}, TargetFormObj.omit({id: true, existingBreaks: true})).refine(data => {
  if (data.starttime && data.endtime) {
    return getTimeDifferneceInMins(data.starttime, data.endtime) >= 0
  }
  return true
}, 'Start time must be earlier than end time')

export async function updateRecord(
  id: string,
  month: string | null,
  data: {endtime: string} | undefined,
  prevState: any,
  formData: FormData
) {
  if (data) {
    // End working
    const {endtime} = data
    try {
      await sql`
        UPDATE records
        SET endtime=${endtime}
        WHERE id=${id};
      `
    } catch (error) {
      return {
        message: "Database error: failed to update endtime of record",
      }
    }
    revalidatePath("/")
    redirect("/")
  } else {
    // edit record via form
    const validatedFields = UpdateFormSchema.safeParse({
      date: formData.get("date"),
      starttime: formData.get("starttime"),
      existing_breakIds: formData.getAll("existing_breakId"),
      existing_breakStartTimes: formData.getAll("existing_breakStartTime"),
      existing_breakEndTimes: formData.getAll("existing_breakEndTime"),
      new_breakStartTimes: formData.getAll("new_breakStartTime"),
      new_breakEndTimes: formData.getAll("new_breakEndTime"),
      endtime: formData.get("endtime"),
    })
    console.log(JSON.stringify(validatedFields.error))
    if (!validatedFields.success) {
      return {
        message: "Failed to update record",
        errors: validatedFields.error.issues.reduce((acc: any, curr: any) => {
           const key = curr['path'][0]
           if (key in acc) {
            acc[key].indexTuples.push([curr['path'][1], curr['path'][2]])
           } else {
            acc[key] = {
              message: curr['message'],
              indexTuples: [[curr['path'][1], curr['path'][2]]]
             }
           }
           return acc
        }, {}),
      }
    }
    let {
      date,
      starttime,
      existingBreaks,
      newBreaks,
      endtime,
    } = validatedFields.data

    console.log(JSON.stringify(existingBreaks))

    try {
      await sql`
        UPDATE records
        SET date=${date}, starttime=${starttime}, endtime=${
        endtime ? endtime : null
      }
        WHERE id=${id};
      `
      if (existingBreaks && existingBreaks.length > 0) {
        await Promise.all(
          existingBreaks.map(
            ([id, starttime, endtime]) => {
              if (!starttime && !endtime) {
                deleteBreak(id)
              }
              if (starttime) {
                updateBreak({id, starttime, endtime}, false)
              } else {
                return {
                  message: "Failed to update record: break star time is empty but end time is not",
                }
              }
            }
          )
        )
      }
      if (newBreaks && newBreaks.length > 0) {
        await Promise.all(
          newBreaks.map(
            ([starttime, endtime]) => createBreak({starttime, endtime, recordId: id})
          )
        )
      }
    } catch (error) {
      return {
        message: "Database error: failed to update record",
      }
    }
    revalidatePath("/records")
    if (month) {
      redirect(`/records?month=${month}&edited=${id}`)
    } else {
      redirect(`/records?edited=${id}`)
    }
  }
}

export async function deleteBreak(id: string) {
  try {
		await sql`
	    DELETE FROM breaks WHERE id=${id};
		`
		revalidatePath('/records');
		return {message: 'Deleted break'}
	} catch (error) {
		console.log(`Database error: ${error}`)
    return {
      message: "Database error: failed to delete break",
    }
	}
}

export async function createRecord(data: {date: string, starttime: string} | undefined, formData: FormData) {
  if (data) {
    const {date, starttime} = data
    try {
      await sql`
        INSERT INTO records (date, starttime)
        VALUES (${date}, ${starttime});
      `
    } catch (error) {
      return {
        message: "Database error: failed to create record",
      }
    }
    revalidatePath("/")
    redirect("/")
  } else {
    const validatedFields = CreateFormSchema.safeParse({
      date: formData.get("date"),
      starttime: formData.get("starttime"),
      new_breakStartTimes: formData.getAll("new_breakStartTime"),
      new_breakEndTimes: formData.getAll("new_breakEndTime"),
      endtime: formData.get("endtime"),
    })
    if (!validatedFields.success) {
      return {
        message: "Failed to create record",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }
    const { date, starttime, newBreaks, endtime } =
    validatedFields.data
    try {
      const recordData = await sql`
        INSERT INTO records (date, starttime, endtime)
        VALUES (${date}, ${starttime}, ${endtime})
        RETURNING id;
      `
      const recordId = recordData.rows[0].id

      if (newBreaks && newBreaks.length > 0) {
        await Promise.all(
          newBreaks.map(
            ([starttime, endtime]) => sql`
              INSERT INTO breaks (recordId, starttime, endtime)
              VALUES (${recordId}, ${starttime}, ${endtime});
            `
          )
        )
      }
    } catch (error) {
      return {
        message: `Database error: ${error}`,
      }
    }
    revalidatePath("/records")
    redirect("/records")
  }
}

export async function createBreak(data: Partial<IBreak>) {
  const {recordId, starttime} = data
  try {
    if (data.endtime) {
      await sql`
        INSERT INTO breaks (recordId, starttime, endtime)
        VALUES (${recordId}, ${starttime}, ${data.endtime});
      `
    } else {
      await sql`
        INSERT INTO breaks (recordId, starttime)
        VALUES (${recordId}, ${starttime});
      `
    }
  } catch (error) {
    return {
      message: "Database error: failed to create break",
    }
  }
  revalidatePath("/")
  revalidatePath("/records")
}

export async function updateBreak(data: Partial<IBreak>, isEndingBreak: boolean) {
  try {
    if (isEndingBreak) {
      if (!data.recordId) {
        return
      }
      const record = await fetchRecordById(data.recordId)
      if (!record) {
        return
      }
      const targetBreak = record.breaks.findLast((b) => !b.endtime)
      if (!targetBreak) {
        return
      }
      await sql`
        UPDATE breaks
        SET endtime=${data.endtime}
        WHERE id=${targetBreak.id};
      `
    } else {
      const id = data.id
      if (!id) {
        return
      }
      const starttime = data.starttime ? data.starttime : null
      const endtime = data.endtime ? data.endtime : null
      await sql`
        UPDATE breaks
        SET starttime=${starttime}, endtime=${endtime}
        WHERE id=${id};
      `
    }
  } catch (error) {
    return {
      message: "Database error: failed to update endtime of break",
    }
  }
  revalidatePath("/")
}
