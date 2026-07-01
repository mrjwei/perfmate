import { describe, it, expect } from 'vitest'
import { authConfig } from '@/auth.config'

describe('authConfig', () => {
  it('trusts the host so Vercel preview deployments (which get a new host per build) work', () => {
    expect(authConfig.trustHost).toBe(true)
  })

  it('expires sessions after 24 hours', () => {
    expect(authConfig.session?.maxAge).toBe(24 * 60 * 60)
  })

  it('propagates the user id from the JWT into the session', async () => {
    const token = { id: 'user-1' }
    const session = await authConfig.callbacks!.session!({ session: { user: {} }, token } as any)
    expect(session.user.id).toBe('user-1')
  })

  it('sets token.id from the user on sign-in', async () => {
    const token: Record<string, unknown> = {}
    const result = await authConfig.callbacks!.jwt!({
      token,
      user: { id: 'user-2' },
    } as any)
    expect(result.id).toBe('user-2')
  })
})
