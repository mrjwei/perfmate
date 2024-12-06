import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import Clock from './Clock'

describe('Clock', () => {
  let mockDate = new Date('2024-07-27T01:02:03')

  afterEach(() => {
    vi.setSystemTime(Date.now())
    vi.useRealTimers()
    mockDate = new Date('2024-07-27T01:02:03')
    cleanup()
  })

  it('renders initial time correctly', () => {
    vi.setSystemTime(mockDate)
    render(<Clock />)
    expect(screen.getByText('01:02:03')).toBeInTheDocument()
    expect(screen.getByText('2024-07-27 (Sat)')).toBeInTheDocument()
  })

  it('updates time every second', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    render(<Clock />)
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
    mockDate = new Date('2024-07-27T23:59:59')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    render(<Clock />)
    expect(screen.getByText('23:59:59')).toBeInTheDocument()
    expect(screen.getByText('2024-07-27 (Sat)')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('24:00:00')).toBeInTheDocument()
    expect(screen.getByText('2024-07-28 (Sun)')).toBeInTheDocument()
  })
})
