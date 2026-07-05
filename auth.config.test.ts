import { describe, it, expect } from 'vitest'
import { authConfig } from '@/auth.config'

describe('authConfig', () => {
  it('trusts the host so Vercel preview deployments (which get a new host per build) work', () => {
    expect(authConfig.trustHost).toBe(true)
  })

  it('expires sessions after 24 hours', () => {
    expect(authConfig.session?.maxAge).toBe(24 * 60 * 60)
  })

  it('propagates the user id and role from the JWT into the session', async () => {
    const token = { id: 'user-1', role: 'admin' }
    const session = await authConfig.callbacks!.session!({ session: { user: {} }, token } as any)
    expect(session.user.id).toBe('user-1')
    expect(session.user.role).toBe('admin')
  })

  it('sets token.id and token.role from the user on sign-in', async () => {
    const token: Record<string, unknown> = {}
    const result = await authConfig.callbacks!.jwt!({
      token,
      user: { id: 'user-2', role: 'user' },
    } as any)
    expect(result.id).toBe('user-2')
    expect(result.role).toBe('user')
  })
})
