"use server"

import { sql } from "@vercel/postgres"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  getFormattedDateString,
  getFormattedTimeString,
  zip,
} from "@/app/lib/helpers"
import { fetchRecordById } from "@/app/lib/api"

const FormSchema = z.object({
  id: z.string(),
  date: z.string(),
  starttime: z.string(),
  breakIds: z.array(z.string()).optional(),
  breakStartTimes: z.array(z.string().min(1)),
  breakEndTimes: z.array(z.string().nullable()),
  endtime: z.string().nullable(),
})

const UpdateRecordSchema = FormSchema.omit({
  id: true,
  breakIds: true,
  breakStartTimes: true,
  breakEndTimes: true
}).extend({
  existing_breakIds: z.array(z.string()).optional(),
  existing_breakStartTimes: z.array(z.string().min(1)),
  existing_breakEndTimes: z.array(z.string().nullable()),
  new_breakIds: z.array(z.string()).optional(),
  new_breakStartTimes: z.array(z.string().min(1)),
  new_breakEndTimes: z.array(z.string().nullable()),
})
const CreateRecordSchema = FormSchema.omit({ id: true })

export async function updateRecord(
  id: string,
  month: string | null,
  formData: FormData
) {
  const validatedFields = UpdateRecordSchema.safeParse({
    date: formData.get("date"),
    starttime: formData.get("starttime"),
    existing_breakIds: formData.getAll("existing_breakId"),
    existing_breakStartTimes: formData.getAll("existing_breakStartTime"),
    existing_breakEndTimes: formData.getAll("existing_breakEndTime"),
    new_breakIds: formData.getAll("new_breakId"),
    new_breakStartTimes: formData.getAll("new_breakStartTime"),
    new_breakEndTimes: formData.getAll("new_breakEndTime"),
    endtime: formData.get("endtime"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to update record",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  let {
    date,
    starttime,
    existing_breakIds,
    existing_breakStartTimes,
    existing_breakEndTimes,
    new_breakIds,
    new_breakStartTimes,
    new_breakEndTimes,
    endtime,
  } = validatedFields.data

  const existingBreakTimes = zip(
    null,
    existing_breakIds,
    existing_breakStartTimes,
    existing_breakEndTimes
  )

  const newBreakTimes = zip(
    null,
    new_breakStartTimes,
    new_breakEndTimes
  )

  try {
    await sql`
      UPDATE records
      SET date=${date}, starttime=${starttime}, endtime=${
      endtime ? endtime : null
    }
      WHERE id=${id};
    `
    await Promise.all(
      existingBreakTimes.map(
        ([id, starttime, endtime]) => sql`
          UPDATE breaks
          SET starttime=${starttime}, endtime=${endtime}
          WHERE id=${id};
        `
      )
    )
    await Promise.all(
      newBreakTimes.map(
        ([starttime, endtime]) => sql`
          INSERT INTO breaks (recordId, starttime, endtime)
          VALUES (${id}, ${starttime}, ${endtime});
        `
      )
    )
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

export async function updateRecordEndTime(endtime: string, id: string) {
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
}

export async function createRecord(data: { date: string; starttime: string }) {
  const { date, starttime } = data

  try {
    await sql`
      INSERT INTO records (date, starttime)
      VALUES (${date}, ${starttime});
    `
    revalidatePath("/")
    redirect("/")
  } catch (error) {
    return {
      message: "Database error: failed to create record",
    }
  }
}

export async function createFullRecord(formData: FormData) {
  const validatedFields = CreateRecordSchema.safeParse({
    date: formData.get("date"),
    starttime: formData.get("starttime"),
    breakStartTimes: formData.getAll("breakStartTime"),
    breakEndTimes: formData.getAll("breakEndTime"),
    endtime: formData.get("endtime"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to create record",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  let { date, starttime, breakStartTimes, breakEndTimes, endtime } =
    validatedFields.data

  if (!endtime) {
    endtime = null
  }

  const breakTimes = zip(null, breakStartTimes, breakEndTimes)

  breakEndTimes = breakEndTimes.map((t) => (!t ? null : t))

  try {
    const data = await sql`
      INSERT INTO records (date, starttime, endtime)
      VALUES (${date}, ${starttime}, ${endtime})
      RETURNING id;
    `
    const recordId = data.rows[0].id

    if (breakTimes.length > 0) {
      await Promise.all(
        breakTimes.map(
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

export async function createBreak(starttime: string, recordId: string) {
  try {
    await sql`
      INSERT INTO breaks (recordId, starttime)
      VALUES (${recordId}, ${starttime});
    `
  } catch (error) {
    return {
      message: "Database error: failed to create break",
    }
  }
  revalidatePath("/")
  revalidatePath("/records")
  redirect("/")
}

export async function updateBreakEndTime(endtime: string, recordId: string) {
  const record = await fetchRecordById(recordId)
  const targetBreak = record.breaks.find((b) => !b.endtime)
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
      message: "Database error: failed to update endtime of break",
    }
  }
  revalidatePath("/")
  redirect("/")
}
