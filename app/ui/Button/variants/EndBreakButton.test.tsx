import React from 'react'
import { describe, afterEach, vi, it, expect } from "vitest"
import {render, screen, cleanup, fireEvent, waitFor} from '@testing-library/react';
import EndBreakButton from './EndBreakButton';
import * as actions from '@/app/lib/actions'

describe('EndBreakButton', () => {
  const renderEl = (status: string = "IN-BREAK") => {
    render(<EndBreakButton record={null} disabled={status !== "IN-BREAK"} endtimeStr="13:00" />)
  }
  const getButton = (name: string) => {
    return screen.getByRole('button', {name})
  }

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it('renders a form', () => {
    renderEl()
    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('renders a button inside the form', () => {
    renderEl()
    const form = document.querySelector('form')
    const button = getButton('End Break')
    expect(button).toBeInTheDocument()
    expect(button.parentElement).toBe(form)
  })

  it('has a label saying "End Break Break" by default', () => {
    renderEl()
    expect(getButton('End Break').textContent).toBe('End Break')
  })

  it('has an expected class name for background color', () => {
    renderEl()
    expect(getButton('End Break')).toHaveClass('bg-purple-500')
  })

  it('is not disabled when status is "IN-BREAK"', () => {
    renderEl("IN-BREAK")
    expect(getButton('End Break')).not.toBeDisabled()
  })

  it('is disabled when status is "IN-WORK"', () => {
    renderEl("IN-WORK")
    expect(getButton('End Break')).toBeDisabled()
  })

  it('is disabled when status is "BEFORE-WORK"', () => {
    renderEl("BEFORE-WORK")
    expect(getButton('End Break')).toBeDisabled()
  })

  it('is disabled when status is "AFTER-WORK"', () => {
    renderEl("AFTER-WORK")
    expect(getButton('End Break')).toBeDisabled()
  })

  it('changes label to "Processing" during submission and reverts to "End Break" when completed', async () => {
    vi.spyOn(actions, 'endBreak').mockResolvedValue()
    renderEl()
    fireEvent.click(getButton('End Break'))
    expect(getButton('Processing')).toBeInTheDocument()
    expect(actions.endBreak).toBeCalledTimes(1)
    await waitFor(() => expect(getButton('End Break')).toBeInTheDocument())
  })
})
