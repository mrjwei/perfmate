import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import Clock from './clock'

describe('Clock', () => {
  let mockDate = new Date('2024-07-27T01:02:03+09:00')

  afterEach(() => {
    vi.setSystemTime(Date.now())
    vi.useRealTimers()
    mockDate = new Date('2024-07-27T01:02:03+09:00')
    cleanup()
  })

  it('renders initial time correctly', () => {
    vi.setSystemTime(mockDate)
    render(<Clock timezone="Asia/Tokyo" />)
    expect(screen.getByText('01:02:03')).toBeInTheDocument()
    expect(screen.getByText('2024-07-27 (Sat)')).toBeInTheDocument()
  })

  it('updates time every second', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    render(<Clock timezone="Asia/Tokyo" />)
    expect(screen.getByText('01:02:03')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('01:02:04')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('01:02:05')).toBeInTheDocument()
  })

  it('updates date string correctly', async () => {
    mockDate = new Date('2024-07-27T23:59:59+09:00')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    render(<Clock timezone="Asia/Tokyo" />)
    expect(screen.getByText('23:59:59')).toBeInTheDocument()
    expect(screen.getByText('2024-07-27 (Sat)')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Node's ICU formats midnight with hour12:false as '00:00:00' (older
    // ICU versions returned '24:00:00' for this edge case) — assert against
    // the current, standard behavior rather than a version-specific quirk.
    expect(screen.getByText('00:00:00')).toBeInTheDocument()
    expect(screen.getByText('2024-07-28 (Sun)')).toBeInTheDocument()
  })
})
