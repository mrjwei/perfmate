"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcrypt"
import { getFormattedDateString, zip } from "@/app/lib/helpers"
import { fetchRecordById, fetchUserByEmail } from "@/app/lib/api"
import {
  updateSchema,
  creationSchema,
  userCreationSchema,
  userSettingsSchema,
  userUpdateSchema,
} from "@/app/lib/schemas"
import { signIn, signOut as authSignOut } from "@/auth"
import { AuthError } from "next-auth"
import { IUser } from "@/app/lib/types"

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

export async function deleteRecord(id: string, month?: string) {
  let date
  try {
    const data = await sql`
	    DELETE FROM records WHERE id=${id}
      RETURNING date;
		`
    date = getFormattedDateString(data.rows[0].date)
  } catch (error) {
    return {
      message: "Database error: failed to delete record",
    }
  }
  revalidatePath("/app/records")
  if (month) {
    redirect(`/app/records?month=${month}&date=${date}`)
  } else {
    redirect(`/app/records?date=${date}`)
  }
}

export async function createRecord(
  userId: string,
  date: string,
  starttime: string,
  endtime?: string | null
) {
  console.log('create record')
  try {
    let data
    if (endtime && endtime !== null) {
      data = await sql`
        INSERT INTO records (userid, date, starttime, endtime)
        VALUES (${userId}, ${date}, ${starttime}, ${endtime})
        RETURNING id;
      `
    } else {
      data = await sql`
        INSERT INTO records (userid, date, starttime)
        VALUES (${userId}, ${date}, ${starttime})
        RETURNING id;
      `
    }
    console.log('record data: ', JSON.stringify(data))
    return data
  } catch (error) {
    console.error('oops error: ', error)
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
  date: string,
  starttime: string
) {
  createRecord(userId, date, starttime)
  revalidatePath("/app")
  redirect("/app")
}

export async function endWorking(id: string | null, endtime: string) {
  if (!id) {
    return
  }
  updateRecord(id, endtime)
  revalidatePath("/app")
  redirect("/app")
}

export async function editForm(
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

  let {
    id: validatedRecordId,
    date: validatedDate,
    starttime: validatedStarttime,
    endtime: validatedEndtime,
    breaks: validatedBreaks,
  } = validatedFields.data

  try {
    if (!validatedStarttime && !validatedEndtime) {
      // If both start and end times are empty, delete the record
      deleteRecord(validatedRecordId)
    } else if (validatedStarttime) {
      // Otherwise update record
      const endtime = validatedEndtime ? validatedEndtime : null
      updateRecord(id, endtime, validatedStarttime, validatedDate)
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
            deleteBreak(breakId!)
          } else if (existingBreak.length === 0 && !starttime && !endtime) {
            return
          } else if (existingBreak.length > 0 && starttime) {
            updateBreak(breakId, starttime, endtime)
          } else if (existingBreak.length === 0 && starttime) {
            createBreak(validatedRecordId, starttime, endtime)
          }
        })
      )
    }
  } catch (error) {
    return {
      message: "Database error: failed to update record",
    }
  }
  revalidatePath("/app")
  revalidatePath("/app/records")
  if (month) {
    redirect(`/app/records?month=${month}&date=${validatedDate}`)
  } else {
    redirect(`/app/records?date=${validatedDate}`)
  }
}

export async function startBreak(recordId: string | null, starttime: string) {
  if (!recordId) {
    return
  }
  createBreak(recordId, starttime)
  revalidatePath("/app")
  redirect("/app")
}

export async function endBreak(recordId: string | null, endtime: string) {
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
  updateBreak(targetBreak.id, undefined, endtime)
  revalidatePath("/app")
  redirect("/app")
}

export async function creationForm(
  userId: string,
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

  let {
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
            createBreak(recordId, starttime, parsedEndtime)
          })
        )
      }
    }
  } catch (error) {
    return {
      message: `Database error: ${error}`,
    }
  }
  revalidatePath("/app/records")
  if (month) {
    redirect(`/app/records?month=${month}&date=${validatedDate}`)
  } else {
    redirect(`/app/records?date=${validatedDate}`)
  }
}

export async function authenticate(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/app",
    })
  } catch (error: any) {
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
  const { name, email, password, hourlywages, currency, taxincluded } = data

  const existingUser = await fetchUserByEmail(email)
  if (existingUser) {
    return
  }

  try {
    const data = await sql`
      INSERT INTO users (name, email, password, hourlywages, currency, taxincluded)
      VALUES (${name}, ${email}, ${password}, ${hourlywages}, ${currency}, ${taxincluded})
      RETURNING email;
    `
    return data.rows[0].email
  } catch (error) {
    return {
      message: "Database error: failed to create user",
    }
  }
}

export async function updateUser(data: Partial<IUser>) {
  if (!data.id) {
    return
  }

  try {
    if (data.name) {
      await sql`
        UPDATE users
        SET name=${data.name}, hourlywages=${data.hourlywages}, currency=${data.currency}, taxincluded=${data.taxincluded}
        WHERE id=${data.id};
      `
    } else {
      await sql`
        UPDATE users
        SET hourlywages=${data.hourlywages}, currency=${data.currency}, taxincluded=${data.taxincluded}
        WHERE id=${data.id};
      `
    }
  } catch (error) {
    return {
      message: "Database error: failed to update user",
    }
  }
}

export async function signup(prevState: any, formData: FormData) {
  const validatedFields = userCreationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!validatedFields.success) {
    return JSON.stringify(validatedFields.error.flatten().fieldErrors)
  }
  const password = await bcrypt.hash(validatedFields.data.password, 10)

  let email

  try {
    email = await createUser({
      ...validatedFields.data,
      password,
      currency: "JP yen",
      taxincluded: false,
    })
    if (!email) {
      return "Email address unavailable. Please use another one."
    }
  } catch (error: any) {
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
  redirect(`/signup/step-2?email=${email}`)
}

export async function setUserInfo(prevState: any, formData: FormData) {
  const validatedFields = userSettingsSchema.safeParse({
    hourlywages: formData.get("hourlywages"),
    currency: formData.get("currency"),
    taxincluded: formData.get("taxincluded"),
  })
  console.log(validatedFields.error?.issues)
  if (!validatedFields.success) {
    return JSON.stringify(validatedFields.error.flatten().fieldErrors)
  }
  const email = formData.get("email") as string
  const { hourlywages, currency } = validatedFields.data

  try {
    const user = await fetchUserByEmail(email)
    await updateUser({
      id: user.id,
      hourlywages: hourlywages ? hourlywages : undefined,
      currency: currency ? currency : undefined,
    })
    await signIn("credentials", {
      email: user.email,
      password: user.password,
      redirectTo: "/app",
    })
  } catch (error: any) {
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

export async function signOut() {
  await authSignOut({ redirectTo: "/login" })
}

export async function updateUserInfo(prevState: any, formData: FormData) {
  const validatedFields = userUpdateSchema.safeParse({
    id: formData.get("userid"),
    name: formData.get("username"),
    hourlywages: formData.get("hourlywages"),
    currency: formData.get("currency"),
    taxincluded: formData.get("taxincluded"),
  })
  console.log(JSON.stringify(validatedFields.error?.flatten().fieldErrors))
  if (!validatedFields.success) {
    return {
      message: "Failed to update user",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, name, hourlywages, currency, taxincluded } =
    validatedFields.data

  try {
    await updateUser({ id, name, hourlywages, currency, taxincluded })
  } catch (error: any) {
    throw error
  }
  revalidatePath("/app")
  revalidatePath("/app/setting")
  redirect("/")
}
