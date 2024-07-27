import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, cleanup } from '@testing-library/react'
import Clock from './clock'

describe('Clock', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    const date = new Date('2024-07-27T01:02:03')
    vi.setSystemTime(date)
    render(<Clock initialTime={date} />)
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })
  it('renders initial time correctly', () => {
    expect(screen.getByText('01:02:03')).toBeInTheDocument()
  })
  it('updates time every second', async () => {
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText('01:02:04')).toBeInTheDocument()
  })
})
