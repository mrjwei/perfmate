import { describe, it, expect, vi, beforeEach } from 'vitest'

const sqlMock = Object.assign(vi.fn(), { query: vi.fn() })

vi.mock('@vercel/postgres', () => ({
  sql: sqlMock,
  types: { setTypeParser: vi.fn() },
}))

vi.mock('next/cache', () => ({
  unstable_noStore: vi.fn(),
}))

const { fetchThreadById, fetchRecordById, fetchUserByEmail } = await import('@/app/lib/api')

beforeEach(() => {
  sqlMock.mockReset()
  sqlMock.query.mockReset()
})

describe('fetchThreadById', () => {
  it('maps a DB row to IThread, coercing numeric columns and dropping null schedule slots', async () => {
    sqlMock.mockResolvedValueOnce({
      rows: [{
        id: 'thread-1',
        userid: 'user-1',
        name: 'Acme Inc',
        hourly_wage: '2000',
        currency: 'JPY',
        tax_included: true,
        tax_rate: '10',
        archived: false,
        schedule: [1, 3, null, 5],
        timezone: 'Asia/Tokyo',
      }],
    })

    const thread = await fetchThreadById('thread-1')

    expect(thread).toEqual({
      id: 'thread-1',
      userid: 'user-1',
      name: 'Acme Inc',
      hourlywage: 2000,
      currency: 'JPY',
      taxincluded: true,
      taxrate: 10,
      archived: false,
      schedule: [1, 3, 5],
      timezone: 'Asia/Tokyo',
    })
  })

  it('returns null when no thread matches', async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] })
    const thread = await fetchThreadById('missing')
    expect(thread).toBeNull()
  })

  it('returns null (not throw) when the query fails', async () => {
    sqlMock.mockRejectedValueOnce(new Error('connection lost'))
    const thread = await fetchThreadById('thread-1')
    expect(thread).toBeNull()
  })
})

describe('fetchRecordById', () => {
  it('maps a record row plus its breaks, formatting DB times to hh:mm', async () => {
    sqlMock
      .mockResolvedValueOnce({
        rows: [{
          id: 'record-1',
          userid: 'user-1',
          thread_id: 'thread-1',
          date: new Date('2024-07-27T00:00:00Z'),
          starttime: '09:05:00',
          endtime: '18:00:00',
        }],
      })
      .mockResolvedValueOnce({
        rows: [{
          id: 'break-1',
          recordid: 'record-1',
          starttime: '12:00:00',
          endtime: null,
        }],
      })

    const record = await fetchRecordById('record-1')

    expect(record?.id).toBe('record-1')
    expect(record?.threadid).toBe('thread-1')
    expect(record?.starttime).toBe('09:05')
    expect(record?.endtime).toBe('18:00')
    expect(record?.breaks).toEqual([
      { id: 'break-1', recordId: 'record-1', starttime: '12:00', endtime: null },
    ])
  })
})

describe('fetchUserByEmail', () => {
  it('returns the matching user row', async () => {
    sqlMock.mockResolvedValueOnce({
      rows: [{ id: 'user-1', name: 'Jane', email: 'jane@example.com' }],
    })
    const user = await fetchUserByEmail('jane@example.com')
    expect(user).toEqual({ id: 'user-1', name: 'Jane', email: 'jane@example.com' })
  })

  it('returns null when no user matches', async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] })
    const user = await fetchUserByEmail('nobody@example.com')
    expect(user).toBeNull()
  })
})
