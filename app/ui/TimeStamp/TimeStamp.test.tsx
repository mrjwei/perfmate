import React from 'react'
import {describe, it, expect, beforeEach, afterEach} from 'vitest'
import {cleanup, render, screen} from '@testing-library/react'
import TimeStamp from '@/app/ui/TimeStamp/TimeStamp';

describe('TimeStamp', () => {
  beforeEach(() => {
    renderComp()
  })
  afterEach(() => {
    cleanup()
  })

  const renderComp = () => {
    render(<TimeStamp heading="Time Stamp" timeStamp='08:30' />)
  }

  it('shows an expected label', () => {
    const comp = screen.getByTestId('timeStamp')
    expect(comp).toHaveTextContent("Time Stamp")
  })
  it('shows expected time in hh:mm format', () => {
    const comp = screen.getByTestId('timeStamp')
    expect(comp).toHaveTextContent("08:30")
  });
})
