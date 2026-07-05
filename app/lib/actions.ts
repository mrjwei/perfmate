"use server"

import { sql } from "@/app/lib/db"
import { revalidatePath } from "next/cache"
import { redirect, getPathname } from "@/i18n/navigation"
// Stripe Checkout/portal URLs are external (checkout.stripe.com), not part
// of this app's locale routing — the plain Next redirect skips next-intl's
// locale-prefixing, which would otherwise mangle an absolute external URL.
import { redirect as externalRedirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { zip } from "@/app/lib/helpers"
import { fetchRecordById, fetchUserByEmail, fetchUserPlanInfo, fetchWorkspacesByUserId } from "@/app/lib/api"
import { sendPasswordResetEmail, sendVerificationEmail } from "@/app/lib/email"
import { assertPlanAllows } from "@/app/lib/plan"
import { stripe, STRIPE_PRO_PRICE_ID } from "@/app/lib/stripe"
import {
  updateSchema,
  creationSchema,
  userCreationSchema,
  userUpdateSchema,
  workspaceCreationSchema,
  workspaceUpdateSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/app/lib/schemas"
import { auth, signIn, signOut as authSignOut } from "@/auth"
import { AuthError } from "next-auth"
import { ZodError, ZodIssue } from "zod"
import { IUser, TRecordFormState } from "@/app/lib/types"

// Zod's flatten().fieldErrors gives string[] per field; TActionState expects
// a single message per field, so this takes the first.
const toFieldErrors = (error: ZodError) =>
  Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [field, messages?.[0] ?? ""])
  )

// Builds the nested error shape record-create-form/record-edit-form read:
// one message per top-level field, plus (for "breaks") a list of which
// break id/field pairs are invalid, deduped since overlap checks can report
// the same break twice from either side of the comparison.
const buildRecordFormErrors = (issues: ZodIssue[]): NonNullable<TRecordFormState>["errors"] => {
  const acc: NonNullable<TRecordFormState>["errors"] = {}
  for (const issue of issues) {
    const path = issue.path
    const fieldName = String(path[0])
    if (!(fieldName in acc)) {
      acc[fieldName] = { message: issue.message }
    }
    if (fieldName === "breaks" && path.length > 1) {
      const details = acc.breaks.errors ?? (acc.breaks.errors = [])
      const rest = path.slice(1)
      for (let i = 0; i < rest.length; i += 2) {
        if (rest[i] === "breaks" || rest[i + 1] === "breaks") {
          continue
        }
        const detail = { id: String(rest[i]), fieldName: String(rest[i + 1]) }
        const exists = details.some((d) => d.id === detail.id && d.fieldName === detail.fieldName)
        if (!exists) {
          details.push(detail)
        }
      }
    }
  }
  return acc
}

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
  } catch {
    return {
      message: "Database error: failed to update record",
    }
  }
}

export async function deleteRecord(workspaceId: string, id: string, month?: string) {
  let date
  try {
    const data = await sql`
	    DELETE FROM records WHERE id=${id}
      RETURNING date;
		`
    date = data.rows[0].date
  } catch {
    return {
      message: "Database error: failed to delete record",
    }
  }
  const locale = await getLocale()
  revalidatePath(getPathname({ href: `/app/${workspaceId}/records`, locale }))
  if (month) {
    redirect({ href: `/app/${workspaceId}/records?month=${month}&date=${date}`, locale })
  } else {
    redirect({ href: `/app/${workspaceId}/records?date=${date}`, locale })
  }
}

export async function createRecord(
  userId: string,
  workspaceId: string,
  date: string,
  starttime: string,
  endtime?: string | null
) {
  try {
    let data
    if (endtime && endtime !== null) {
      data = await sql`
        INSERT INTO records (userid, workspace_id, date, starttime, endtime)
        VALUES (${userId}, ${workspaceId}, ${date}, ${starttime}, ${endtime})
        RETURNING id;
      `
    } else {
      data = await sql`
        INSERT INTO records (userid, workspace_id, date, starttime)
        VALUES (${userId}, ${workspaceId}, ${date}, ${starttime})
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
  } catch {
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
  } catch {
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
  } catch {
    return {
      message: "Database error: failed to create break",
    }
  }
}

export async function startWorking(
  userId: string,
  workspaceId: string,
  date: string,
  starttime: string
) {
  await createRecord(userId, workspaceId, date, starttime)
  const locale = await getLocale()
  revalidatePath(getPathname({ href: `/app/${workspaceId}`, locale }))
  redirect({ href: `/app/${workspaceId}`, locale })
}

export async function endWorking(workspaceId: string, id: string | null, endtime: string) {
  if (!id) {
    return
  }
  await updateRecord(id, endtime)
  const locale = await getLocale()
  revalidatePath(getPathname({ href: `/app/${workspaceId}`, locale }))
  redirect({ href: `/app/${workspaceId}`, locale })
}

export async function editForm(
  workspaceId: string,
  id: string,
  month: string | null,
  prevState: TRecordFormState,
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
      errors: buildRecordFormErrors(validatedFields.error.issues),
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
      await deleteRecord(workspaceId, validatedRecordId)
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
  } catch {
    return {
      message: "Database error: failed to update record",
      errors: {},
    }
  }
  const locale = await getLocale()
  revalidatePath(getPathname({ href: `/app/${workspaceId}`, locale }))
  revalidatePath(getPathname({ href: `/app/${workspaceId}/records`, locale }))
  if (month) {
    redirect({ href: `/app/${workspaceId}/records?month=${month}&date=${validatedDate}`, locale })
  } else {
    redirect({ href: `/app/${workspaceId}/records?date=${validatedDate}`, locale })
  }
}

export async function startBreak(workspaceId: string, recordId: string | null, starttime: string) {
  if (!recordId) {
    return
  }
  await createBreak(recordId, starttime)
  const locale = await getLocale()
  revalidatePath(getPathname({ href: `/app/${workspaceId}`, locale }))
  redirect({ href: `/app/${workspaceId}`, locale })
}

export async function endBreak(workspaceId: string, recordId: string | null, endtime: string) {
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
  const locale = await getLocale()
  revalidatePath(getPathname({ href: `/app/${workspaceId}`, locale }))
  redirect({ href: `/app/${workspaceId}`, locale })
}

export async function creationForm(
  userId: string,
  workspaceId: string,
  month: string | null,
  prevState: TRecordFormState,
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
      errors: buildRecordFormErrors(validatedFields.error.issues),
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
        workspaceId,
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
      errors: {},
    }
  }
  const locale = await getLocale()
  revalidatePath(getPathname({ href: `/app/${workspaceId}/records`, locale }))
  if (month) {
    redirect({ href: `/app/${workspaceId}/records?month=${month}&date=${validatedDate}`, locale })
  } else {
    redirect({ href: `/app/${workspaceId}/records?date=${validatedDate}`, locale })
  }
}

export async function authenticate(prevState: unknown, formData: FormData) {
  try {
    const locale = await getLocale()
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: getPathname({ href: "/app", locale }),
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
      RETURNING id, email;
    `
    return data.rows[0]
  } catch {
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
  } catch {
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

  let user

  try {
    user = await createUser({
      ...validatedFields.data,
      password,
    })
    if (!user || !("email" in user)) {
      return "Email address unavailable. Please use another one."
    }

    const locale = await getLocale()
    await sendEmailVerificationToken(user.id, user.email, locale)

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
      redirectTo: getPathname({ href: "/signup/step-2", locale }),
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

// Tokens are single-use, high-entropy random values, not secrets a user
// chooses — a fast SHA-256 lookup hash is appropriate here, unlike bcrypt
// for passwords (see the migration's header comment for why).
const generateToken = () => {
  const raw = crypto.randomBytes(32).toString("hex")
  const hash = crypto.createHash("sha256").update(raw).digest("hex")
  return { raw, hash }
}
const hashToken = (raw: string) => crypto.createHash("sha256").update(raw).digest("hex")

// NEXTAUTH_URL isn't required for auth itself (trustHost: true), so it isn't
// set anywhere yet — falls back to Vercel's auto-populated VERCEL_URL (no
// scheme) in deployed environments, then localhost for local dev.
const getBaseUrl = () =>
  process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

async function sendEmailVerificationToken(userId: string, email: string, locale: string) {
  const { raw, hash } = generateToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await sql`
    INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
    VALUES (${userId}, ${hash}, ${expiresAt.toISOString()});
  `
  const verifyUrl = new URL(getPathname({ href: `/verify-email/${raw}`, locale }), getBaseUrl()).toString()
  await sendVerificationEmail(email, verifyUrl, locale)
}

export async function requestPasswordReset(prevState: unknown, formData: FormData) {
  const validatedFields = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to send reset email",
      errors: toFieldErrors(validatedFields.error),
    }
  }

  const locale = await getLocale()
  const { email } = validatedFields.data
  const user = await fetchUserByEmail(email)
  // Don't reveal whether the address is registered — same success message
  // either way, so this can't be used to enumerate accounts.
  if (user) {
    const { raw, hash } = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await sql`
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${hash}, ${expiresAt.toISOString()});
    `
    const resetUrl = new URL(getPathname({ href: `/reset-password/${raw}`, locale }), getBaseUrl()).toString()
    await sendPasswordResetEmail(email, resetUrl, locale)
  }

  return { message: "If that email is registered, we've sent a password reset link.", errors: {} }
}

export async function resetPassword(token: string, prevState: unknown, formData: FormData) {
  const validatedFields = resetPasswordSchema.safeParse({
    token,
    password: formData.get("password"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to reset password",
      errors: toFieldErrors(validatedFields.error),
    }
  }

  const tokenHash = hashToken(validatedFields.data.token)
  const result = await sql`
    SELECT id, user_id FROM password_reset_tokens
    WHERE token_hash = ${tokenHash} AND used_at IS NULL AND expires_at > now()
    LIMIT 1;
  `
  const tokenRow = result.rows[0]
  if (!tokenRow) {
    return {
      message: "This password reset link is invalid or has expired. Please request a new one.",
      errors: {},
    }
  }

  const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10)
  await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${tokenRow.user_id};`
  await sql`UPDATE password_reset_tokens SET used_at = now() WHERE id = ${tokenRow.id};`

  const locale = await getLocale()
  redirect({ href: "/login", locale })
}

export async function verifyEmail(token: string) {
  const tokenHash = hashToken(token)
  const result = await sql`
    SELECT id, user_id FROM email_verification_tokens
    WHERE token_hash = ${tokenHash} AND used_at IS NULL AND expires_at > now()
    LIMIT 1;
  `
  const tokenRow = result.rows[0]
  if (!tokenRow) {
    return { success: false }
  }

  await sql`UPDATE users SET email_verified_at = now() WHERE id = ${tokenRow.user_id};`
  await sql`UPDATE email_verification_tokens SET used_at = now() WHERE id = ${tokenRow.id};`
  return { success: true }
}

async function replaceWorkspaceSchedule(workspaceId: string, schedule: number[]) {
  await sql`DELETE FROM workspace_schedules WHERE workspace_id = ${workspaceId};`
  if (schedule.length === 0) {
    return
  }
  await Promise.all(
    schedule.map((weekday) => sql`
      INSERT INTO workspace_schedules (workspace_id, weekday)
      VALUES (${workspaceId}, ${weekday});
    `)
  )
}

export async function createWorkspaceForm(prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Not authenticated", errors: {} }
  }

  const validatedFields = workspaceCreationSchema.safeParse({
    name: formData.get("name"),
    hourlywage: formData.get("hourlywage"),
    currency: formData.get("currency"),
    taxincluded: formData.get("taxincluded"),
    taxrate: formData.get("taxrate"),
    schedule: formData.getAll("schedule"),
    timezone: formData.get("timezone"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to create workspace",
      errors: toFieldErrors(validatedFields.error),
    }
  }
  const { name, hourlywage, currency, taxincluded, taxrate, schedule, timezone } = validatedFields.data

  const [planInfo, existingWorkspaces] = await Promise.all([
    fetchUserPlanInfo(session.user.id),
    fetchWorkspacesByUserId(session.user.id),
  ])
  const planCheck = assertPlanAllows(planInfo?.plan ?? "free", {
    type: "create_workspace",
    currentWorkspaceCount: existingWorkspaces.filter((w) => !w.archived).length,
  })
  if (!planCheck.allowed) {
    return { message: planCheck.reason, errors: {} }
  }

  let workspaceId
  try {
    const data = await sql`
      INSERT INTO workspaces (userid, name, hourly_wage, currency, tax_included, tax_rate, timezone)
      VALUES (${session.user.id}, ${name}, ${hourlywage}, ${currency}, ${taxincluded}, ${taxrate}, ${timezone})
      RETURNING id;
    `
    workspaceId = data.rows[0].id
    await replaceWorkspaceSchedule(workspaceId, schedule)
  } catch {
    return { message: "Database error: failed to create workspace", errors: {} }
  }
  const locale = await getLocale()
  revalidatePath(getPathname({ href: "/app", locale }))
  redirect({ href: `/app/${workspaceId}`, locale })
}

export async function updateWorkspaceForm(
  workspaceId: string,
  prevState: unknown,
  formData: FormData
) {
  const validatedFields = workspaceUpdateSchema.safeParse({
    id: workspaceId,
    name: formData.get("name"),
    hourlywage: formData.get("hourlywage"),
    currency: formData.get("currency"),
    taxincluded: formData.get("taxincluded"),
    taxrate: formData.get("taxrate"),
    schedule: formData.getAll("schedule"),
    timezone: formData.get("timezone"),
  })
  if (!validatedFields.success) {
    return {
      message: "Failed to update workspace",
      errors: toFieldErrors(validatedFields.error),
    }
  }
  const { id, name, hourlywage, currency, taxincluded, taxrate, schedule, timezone } = validatedFields.data

  try {
    await sql`
      UPDATE workspaces
      SET name=${name}, hourly_wage=${hourlywage}, currency=${currency}, tax_included=${taxincluded}, tax_rate=${taxrate}, timezone=${timezone}
      WHERE id=${id};
    `
    await replaceWorkspaceSchedule(id, schedule)
  } catch {
    return {
      message: "Database error: failed to update workspace",
      errors: {},
    }
  }
  const locale = await getLocale()
  revalidatePath(getPathname({ href: `/app/${workspaceId}`, locale }))
  revalidatePath(getPathname({ href: "/app/workspaces", locale }))
  redirect({ href: `/app/${workspaceId}/settings`, locale })
}

export async function archiveWorkspace(workspaceId: string) {
  await sql`UPDATE workspaces SET archived = true WHERE id = ${workspaceId};`
  const locale = await getLocale()
  revalidatePath(getPathname({ href: "/app/workspaces", locale }))
  redirect({ href: "/app/workspaces", locale })
}

export async function unarchiveWorkspace(workspaceId: string) {
  await sql`UPDATE workspaces SET archived = false WHERE id = ${workspaceId};`
  const locale = await getLocale()
  revalidatePath(getPathname({ href: "/app/workspaces", locale }))
  redirect({ href: "/app/workspaces", locale })
}

export async function signOut() {
  const locale = await getLocale()
  await authSignOut({ redirectTo: getPathname({ href: "/login", locale }) })
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

  const locale = await getLocale()
  revalidatePath(getPathname({ href: "/app", locale }))
  revalidatePath(getPathname({ href: "/app/setting", locale }))
  redirect({ href: "/app/setting", locale })
}

async function getOrCreateStripeCustomerId(userId: string, email: string): Promise<string> {
  const planInfo = await fetchUserPlanInfo(userId)
  if (planInfo?.stripeCustomerId) {
    return planInfo.stripeCustomerId
  }
  const customer = await stripe!.customers.create({ email, metadata: { userId } })
  await sql`UPDATE users SET stripe_customer_id = ${customer.id} WHERE id = ${userId};`
  return customer.id
}

export async function createCheckoutSession(_prevState: unknown, _formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return { message: "Not authenticated" }
  }
  if (!stripe || !STRIPE_PRO_PRICE_ID) {
    return { message: "Billing isn't configured yet. Please try again later." }
  }

  const locale = await getLocale()
  const customerId = await getOrCreateStripeCustomerId(session.user.id, session.user.email)

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: new URL(getPathname({ href: "/app/setting", locale }), getBaseUrl()).toString(),
    cancel_url: new URL(getPathname({ href: "/app/setting", locale }), getBaseUrl()).toString(),
  })
  if (!checkoutSession.url) {
    return { message: "Failed to start checkout. Please try again." }
  }
  externalRedirect(checkoutSession.url)
}

export async function createPortalSession(_prevState: unknown, _formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: "Not authenticated" }
  }
  if (!stripe) {
    return { message: "Billing isn't configured yet. Please try again later." }
  }

  const locale = await getLocale()
  const planInfo = await fetchUserPlanInfo(session.user.id)
  if (!planInfo?.stripeCustomerId) {
    return { message: "No billing account found for this user yet." }
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: planInfo.stripeCustomerId,
    return_url: new URL(getPathname({ href: "/app/setting", locale }), getBaseUrl()).toString(),
  })
  externalRedirect(portalSession.url)
}
