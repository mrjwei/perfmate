import { describe, it, expect, vi } from 'vitest'
import { editForm, creationForm, signup, createThreadForm, updateUserInfo } from '@/app/lib/actions'

// These functions only reach the DB (sql`...`) after validation succeeds.
// Every case here is a validation failure, so no @vercel/postgres/next
// mocking is needed — they return before touching the database or calling
// redirect()/revalidatePath().

describe('editForm validation', () => {
  it('reports a field-level error and does not throw when starttime is missing but endtime is present', async () => {
    const formData = new FormData()
    formData.set('recordId', '2e1fa58c-6b94-4c1a-8f03-d858453a66fb')
    formData.set('date', '2024-07-27')
    formData.set('endtime', '18:00')

    const result = await editForm('threadid', '2e1fa58c-6b94-4c1a-8f03-d858453a66fb', null, undefined, formData)

    expect(result?.message).toBe('Failed to update record')
    expect(result?.errors.starttime?.message).toBeTruthy()
  })

  it('flags overlapping breaks by id via the errors array (not a "details" key)', async () => {
    const formData = new FormData()
    formData.set('recordId', '2e1fa58c-6b94-4c1a-8f03-d858453a66fb')
    formData.set('date', '2024-07-27')
    formData.set('starttime', '09:00')
    formData.set('endtime', '18:00')
    formData.append('breakid', 'break-1')
    formData.append('breakstarttime', '10:00')
    formData.append('breakendtime', '11:00')
    formData.append('breakid', 'break-2')
    formData.append('breakstarttime', '10:30')
    formData.append('breakendtime', '11:30')

    const result = await editForm('threadid', '2e1fa58c-6b94-4c1a-8f03-d858453a66fb', null, undefined, formData)

    expect(result?.message).toBe('Failed to update record')
    const breakErrors = result?.errors.breaks?.errors
    expect(breakErrors).toBeDefined()
    expect(breakErrors?.some((e) => e.id === 'break-1')).toBe(true)
    expect(breakErrors?.some((e) => e.id === 'break-2')).toBe(true)
  })
})

describe('creationForm validation', () => {
  it('flags overlapping breaks by id via the errors array', async () => {
    // Regression test: this reducer used to write break-error details to a
    // "details" key while record-create-form.tsx read from "errors", so
    // break-level validation errors were silently never highlighted.
    const formData = new FormData()
    formData.set('date', '2024-07-27')
    formData.set('starttime', '09:00')
    formData.set('endtime', '18:00')
    formData.append('breakid', 'break-1')
    formData.append('breakstarttime', '10:00')
    formData.append('breakendtime', '11:00')
    formData.append('breakid', 'break-2')
    formData.append('breakstarttime', '10:30')
    formData.append('breakendtime', '11:30')

    const result = await creationForm('userid', 'threadid', null, undefined, formData)

    expect(result?.message).toBe('Failed to create record')
    const breakErrors = result?.errors.breaks?.errors
    expect(breakErrors).toBeDefined()
    expect(breakErrors?.some((e) => e.id === 'break-1')).toBe(true)
    expect(breakErrors?.some((e) => e.id === 'break-2')).toBe(true)
  })

  it('reports a starttime error when only endtime is provided', async () => {
    const formData = new FormData()
    formData.set('date', '2024-07-27')
    formData.set('endtime', '18:00')

    const result = await creationForm('userid', 'threadid', null, undefined, formData)

    expect(result?.message).toBe('Failed to create record')
    expect(result?.errors.starttime?.message).toBeTruthy()
  })
})

describe('signup validation', () => {
  it('returns field errors as a JSON string when fields are invalid', async () => {
    const formData = new FormData()
    formData.set('name', 'Jane')
    formData.set('email', 'not-an-email')
    formData.set('password', 'short')

    const result = await signup(undefined, formData)

    expect(typeof result).toBe('string')
    const parsed = JSON.parse(result as string)
    expect(parsed.email).toBeDefined()
    expect(parsed.password).toBeDefined()
  })
})

describe('createThreadForm validation', () => {
  it('returns "Not authenticated" when there is no session', async () => {
    vi.mock('@/auth', () => ({
      auth: vi.fn().mockResolvedValue(null),
    }))
    const formData = new FormData()
    const result = await createThreadForm(undefined, formData)
    expect(result).toEqual({ message: 'Not authenticated', errors: {} })
  })
})

describe('updateUserInfo validation', () => {
  it('reports a field error when the username is empty', async () => {
    const formData = new FormData()
    formData.set('userid', '2e1fa58c-6b94-4c1a-8f03-d858453a66fb')
    formData.set('username', '')

    const result = await updateUserInfo(undefined, formData)

    expect(result?.message).toBe('Failed to update user')
    expect(result?.errors.name).toBeTruthy()
  })
})
