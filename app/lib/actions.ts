"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcrypt"
import { dateToStr, zip } from "@/app/lib/helpers"
import { fetchRecordById, fetchUserByEmail } from "@/app/lib/api"
import {
  updateSchema,
  creationSchema,
  userCreationSchema,
  userUpdateSchema,
  threadCreationSchema,
  threadUpdateSchema,
} from "@/app/lib/schemas"
import { auth, signIn, signOut as authSignOut } from "@/auth"
import { AuthError } from "next-auth"
import { ZodError } from "zod"
import { IUser } from "@/app/lib/types"

// Zod's flatten().fieldErrors gives string[] per field; TActionState expects
// a single message per field, so this takes the first.
const toFieldErrors = (error: ZodError) =>
  Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [field, messages?.[0] ?? ""])
  )

export async function updateRecord(
  id: string,
  endtime: string | null,
  starttime?: string,
  date?: string
) {
  try {
    if (starttime && date) {
      await sql`
        UPDATE records
        SET date=${date}, starttime=${starttime}, endtime=${endtime}
        WHERE id=${id};
      `
    } else {
      await sql`
        UPDATE records
        SET endtime=${endtime}
        WHERE id=${id};
      `
    }
  } catch (error) {
    return {
      message: "Database error: failed to update record",
    }
  }
}

export async function deleteRecord(threadId: string, id: string, month?: string) {
  let date
  try {
    const data = await sql`
	    DELETE FROM records WHERE id=${id}
      RETURNING date;
		`
    date = dateToStr(data.rows[0].date)
  } catch (error) {
    return {
      message: "Database error: failed to delete record",
    }
  }
  revalidatePath(`/app/${threadId}/records`)
  if (month) {
    redirect(`/app/${threadId}/records?month=${month}&date=${date}`)
  } else {
    redirect(`/app/${threadId}/records?date=${date}`)
  }
}

export async function createRecord(
  userId: string,
  threadId: string,
  date: string,
  starttime: string,
  endtime?: string | null
) {
  try {
    let data
    if (endtime && endtime !== null) {
      data = await sql`
        INSERT INTO records (userid, thread_id, date, starttime, endtime)
        VALUES (${userId}, ${threadId}, ${date}, ${starttime}, ${endtime})
        RETURNING id;
      `
    } else {
      data = await sql`
        INSERT INTO records (userid, thread_id, date, starttime)
        VALUES (${userId}, ${threadId}, ${date}, ${starttime})
        RETURNING id;
      `
    }
    return data
  } catch (error) {
    console.error('Database error: failed to create record: ', error)
    return {
      message: "Database error: failed to create record",
    }
  }
}

export async function updateBreak(
  id: string,
  starttime?: string | null,
  endtime?: string | null
) {
  try {
    if (starttime && endtime) {
      await sql`
        UPDATE breaks
        SET starttime=${starttime}, endtime=${endtime}
        WHERE id=${id};
      `
    } else if (starttime === undefined && endtime && endtime !== null) {
      await sql`
        UPDATE breaks
        SET endtime=${endtime}
        WHERE id=${id};
      `
    }
  } catch (error) {
    return {
      message: "Database error: failed to create record",
    }
  }
}

export async function deleteBreak(id: string) {
  try {
    await sql`
	    DELETE FROM breaks WHERE id=${id};
		`
    return { message: "Deleted break" }
  } catch (error) {
    return {
      message: "Database error: failed to delete break",
    }
  }
}

export async function createBreak(
  recordId: string,
  starttime: string,
  endtime?: string | null
) {
  try {
    if (endtime && endtime !== null) {
      await sql`
        INSERT INTO breaks (recordId, starttime, endtime)
        VALUES (${recordId}, ${starttime}, ${endtime});
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
}

export async function startWorking(
  userId: string,
  threadId: string,
  date: string,
  starttime: string
) {
  await createRecord(userId, threadId, date, starttime)
  revalidatePath(`/app/${threadId}`)
  redirect(`/app/${threadId}`)
}

export async function endWorking(threadId: string, id: string | null, endtime: string) {
  if (!id) {
    return
  }
  await updateRecord(id, endtime)
  revalidatePath(`/app/${threadId}`)
  redirect(`/app/${threadId}`)
}

export async function editForm(
  threadId: string,
  id: string,
  month: string | null,
  prevState: any,
  formData: FormData
) {
  const breakIds = formData.getAll("breakid")
  const breakStartTimes = formData.getAll("breakstarttime")
  const breakEndTimes = formData.getAll("breakendtime")
  const breaks = zip(null, breakIds, breakStartTimes, breakEndTimes).map(
    (b) => ({ id: b[0], starttime: b[1], endtime: b[2] })
  )

  const validatedFields = updateSchema.safeParse({
    id: formData.get("recordId"),
    date: formData.get("date"),
    starttime: formData.get("starttime"),
    endtime: formData.get("endtime"),
    breaks,
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to update record",
      errors: validatedFields.error.issues.reduce((acc: any, curr: any) => {
        const path = curr["path"]
        const fieldName = path[0]

        // Initialize the error object for the field if it doesn't exist
        if (!(fieldName in acc)) {
          acc[fieldName] = { message: curr["message"] }
        }

        // Handle the 'breaks' field specifically
        if (fieldName === "breaks" && path.length > 1) {
          if (!acc.breaks.errors) {
            acc.breaks.errors = []
          }

          const detailsArray = path.slice(1)

          // Only push an error detail if it's not already recorded
          for (let i = 0; i < detailsArray.length; i += 2) {
            if (
              detailsArray[i] === "breaks" ||
              detailsArray[i + 1] === "breaks"
            ) {
              continue
            }
            const detail = {
              id: detailsArray[i],
              fieldName: detailsArray[i + 1],
            }
            const exists = acc.breaks.errors.some(
              (err: any) =>
                err.id === detail.id && err.fieldName === detail.fieldName
            )
            if (!exists) {
              acc.breaks.errors.push(detail)
            }
          }
        } else if (path.length === 1) {
          // Handle top-level fields (e.g., 'starttime')
          acc[fieldName] = { message: curr["message"] }
        }

        return acc
      }, {}),
    }
  }

  const {
    id: validatedRecordId,
    date: validatedDate,
    starttime: validatedStarttime,
    endtime: validatedEndtime,
    breaks: validatedBreaks,
  } = validatedFields.data

  try {
    if (!validatedStarttime && !validatedEndtime) {
      // If both start and end times are empty, delete the record
      await deleteRecord(threadId, validatedRecordId)
    } else if (validatedStarttime) {
      // Otherwise update record
      const endtime = validatedEndtime ? validatedEndtime : null
      await updateRecord(id, endtime, validatedStarttime, validatedDate)
    }
    // Handle breaks if any exists
    if (validatedBreaks && validatedBreaks.length > 0) {
      await Promise.all(
        validatedBreaks.map(async ({ id: breakId, starttime, endtime }) => {
          // Determine if this break exists in DB
          const data = await sql`
              SELECT * FROM breaks
              WHERE id = ${breakId}
            `
          const existingBreak = data.rows
          if (existingBreak.length > 0 && !starttime && !endtime) {
            await deleteBreak(breakId!)
          } else if (existingBreak.length === 0 && !starttime && !endtime) {
            return
          } else if (existingBreak.length > 0 && starttime) {
            await updateBreak(breakId, starttime, endtime)
          } else if (existingBreak.length === 0 && starttime) {
            await createBreak(validatedRecordId, starttime, endtime)
          }
        })
      )
    }
  } catch (error) {
    return {
      message: "Database error: failed to update record",
    }
  }
  revalidatePath(`/app/${threadId}`)
  revalidatePath(`/app/${threadId}/records`)
  if (month) {
    redirect(`/app/${threadId}/records?month=${month}&date=${validatedDate}`)
  } else {
    redirect(`/app/${threadId}/records?date=${validatedDate}`)
  }
}

export async function startBreak(threadId: string, recordId: string | null, starttime: string) {
  if (!recordId) {
    return
  }
  await createBreak(recordId, starttime)
  revalidatePath(`/app/${threadId}`)
  redirect(`/app/${threadId}`)
}

export async function endBreak(threadId: string, recordId: string | null, endtime: string) {
  if (!recordId) {
    return
  }
  const record = await fetchRecordById(recordId)
  if (!record) {
    return
  }
  const targetBreak = record.breaks.findLast((b) => !b.endtime)
  if (!targetBreak) {
    return
  }
  await updateBreak(targetBreak.id, undefined, endtime)
  revalidatePath(`/app/${threadId}`)
  redirect(`/app/${threadId}`)
}

export async function creationForm(
  userId: string,
  threadId: string,
  month: string | null,
  prevState: any,
  formData: FormData
) {
  const breakIds = formData.getAll("breakid")
  const breakStartTimes = formData.getAll("breakstarttime")
  const breakEndTimes = formData.getAll("breakendtime")
  const breaks = zip(null, breakIds, breakStartTimes, breakEndTimes).map(
    (b) => ({
      id: b[0],
      starttime: b[1],
      endtime: b[2],
    })
  )

  const validatedFields = creationSchema.safeParse({
    date: formData.get("date"),
    starttime: formData.get("starttime"),
    endtime: formData.get("endtime"),
    breaks,
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to create record",
      errors: validatedFields.error.issues.reduce((acc: any, curr: any) => {
        const path = curr["path"]
        if (path[0] in acc) {
          // Only highlight the first error even if there are multiple
          // regarding the same field
          return acc
        }
        acc[path[0]] = {
          message: curr["message"],
        }
        if (path[0] === "breaks" && path.length > 1) {
          acc[path[0]].details = []
          for (let i = 0; i < path.slice(1).length - 1; i++) {
            acc[path[0]].details.push({ id: path[i], fieldName: path[i + 1] })
          }
        }
        return acc
      }, {}),
    }
  }

  const {
    date: validatedDate,
    starttime: validatedStarttime,
    endtime: validatedEndtime,
    breaks: validatedBreaks,
  } = validatedFields.data

  try {
    if (validatedStarttime) {
      const endtime = validatedEndtime ? validatedEndtime : null

      const data = await createRecord(
        userId,
        threadId,
        validatedDate,
        validatedStarttime,
        endtime
      )
      if (!("rows" in data)) {
        return
      }
      const recordId = data.rows[0].id
      if (validatedBreaks && validatedBreaks.length > 0) {
        await Promise.all(
          validatedBreaks.map(({ starttime, endtime }) => {
            if (!starttime) {
              return
            }
            const parsedEndtime = endtime ? endtime : null
            return createBreak(recordId, starttime, parsedEndtime)
          })
        )
      }
    }
  } catch (error) {
    return {
      message: `Database error: ${error}`,
    }
  }
  revalidatePath(`/app/${threadId}/records`)
  if (month) {
    redirect(`/app/${threadId}/records?month=${month}&date=${validatedDate}`)
  } else {
    redirect(`/app/${threadId}/records?date=${validatedDate}`)
  }
}

export async function authenticate(prevState: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/app",
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Wrong email or password"
        default:
          return "Something went wrong"
      }
    }
    throw error
  }
}

export async function createUser(data: Omit<IUser, "id">) {
  const { name, email, password } = data

  const existingUser = await fetchUserByEmail(email)
  if (existingUser) {
    return
  }

  try {
    const data = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${password})
      RETURNING email;
    `
    return data.rows[0].email
  } catch (error) {
    return {
      message: "Database error: failed to create user",
    }
  }
}

export async function updateUser(data: Pick<IUser, "id" | "name">) {
  try {
    await sql`
      UPDATE users
      SET name=${data.name}
      WHERE id=${data.id};
    `
  } catch (error) {
    return {
      message: "Database error: failed to update user",
    }
  }
}

export async function signup(prevState: unknown, formData: FormData) {
  const validatedFields = userCreationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!validatedFields.success) {
    return JSON.stringify(validatedFields.error.flatten().fieldErrors)
  }
  const plainPassword = validatedFields.data.password
  const password = await bcrypt.hash(validatedFields.data.password, 10)

  let email

  try {
    email = await createUser({
      ...validatedFields.data,
      password,
    })
    if (!email) {
      return "Email address unavailable. Please use another one."
    }

    await signIn("credentials", {
      email,
      password: plainPassword,
      redirectTo: `/signup/step-2`,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials"
        default:
          return "Something went wrong"
      }
    }
    throw error
  }
}

async function replaceThreadSchedule(threadId: string, schedule: number[]) {
  await sql`DELETE FROM thread_schedules WHERE thread_id = ${threadId};`
  if (schedule.length === 0) {
    return
  }
  await Promise.all(
    schedule.map((weekday) => sql`
      INSERT INTO thread_schedules (thread_id, weekday)
      VALUES (${threadId}, ${weekday});
    `)
  )
}

export async function createThreadForm(prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Not authenticated", errors: {} }
  }

  const validatedFields = threadCreationSchema.safeParse({
    name: formData.get("name"),
    hourlywage: formData.get("hourlywage"),
    currency: formData.get("currency"),
    taxincluded: formData.get("taxincluded"),
    taxrate: formData.get("taxrate"),
    schedule: formData.getAll("schedule"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to create thread",
      errors: toFieldErrors(validatedFields.error),
    }
  }
  const { name, hourlywage, currency, taxincluded, taxrate, schedule } = validatedFields.data

  let threadId
  try {
    const data = await sql`
      INSERT INTO threads (userid, name, hourly_wage, currency, tax_included, tax_rate)
      VALUES (${session.user.id}, ${name}, ${hourlywage}, ${currency}, ${taxincluded}, ${taxrate})
      RETURNING id;
    `
    threadId = data.rows[0].id
    await replaceThreadSchedule(threadId, schedule)
  } catch (error) {
    return { message: "Database error: failed to create thread", errors: {} }
  }
  revalidatePath("/app")
  redirect(`/app/${threadId}`)
}

export async function updateThreadForm(
  threadId: string,
  prevState: unknown,
  formData: FormData
) {
  const validatedFields = threadUpdateSchema.safeParse({
    id: threadId,
    name: formData.get("name"),
    hourlywage: formData.get("hourlywage"),
    currency: formData.get("currency"),
    taxincluded: formData.get("taxincluded"),
    taxrate: formData.get("taxrate"),
    schedule: formData.getAll("schedule"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to update thread",
      errors: toFieldErrors(validatedFields.error),
    }
  }
  const { id, name, hourlywage, currency, taxincluded, taxrate, schedule } = validatedFields.data

  try {
    await sql`
      UPDATE threads
      SET name=${name}, hourly_wage=${hourlywage}, currency=${currency}, tax_included=${taxincluded}, tax_rate=${taxrate}
      WHERE id=${id};
    `
    await replaceThreadSchedule(id, schedule)
  } catch (error) {
    return {
      message: "Database error: failed to update thread",
      errors: {},
    }
  }
  revalidatePath(`/app/${threadId}`)
  revalidatePath("/app/threads")
  redirect(`/app/${threadId}/settings`)
}

export async function archiveThread(threadId: string) {
  await sql`UPDATE threads SET archived = true WHERE id = ${threadId};`
  revalidatePath("/app/threads")
  redirect("/app/threads")
}

export async function unarchiveThread(threadId: string) {
  await sql`UPDATE threads SET archived = false WHERE id = ${threadId};`
  revalidatePath("/app/threads")
  redirect("/app/threads")
}

export async function signOut() {
  await authSignOut({ redirectTo: "/login" })
}

export async function updateUserInfo(prevState: unknown, formData: FormData) {
  const validatedFields = userUpdateSchema.safeParse({
    id: formData.get("userid"),
    name: formData.get("username"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to update user",
      errors: toFieldErrors(validatedFields.error),
    }
  }

  await updateUser(validatedFields.data)

  revalidatePath("/app")
  revalidatePath("/app/setting")
  redirect("/app/setting")
}
