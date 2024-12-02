import React from 'react'
import { describe, afterEach, vi, it, expect } from "vitest"
import {render, screen, cleanup, fireEvent, waitFor} from '@testing-library/react';
import StartBreakButton from './StartBreakButton';
import * as actions from '@/app/lib/actions'

describe('StartBreakButton', () => {
  const renderEl = (status: string = "IN-WORK") => {
    render(<StartBreakButton record={null} disabled={status === "BEFORE-WORK" || status === "AFTER-WORK" || status === "IN-BREAK"} starttimeStr="12:00" />)
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
    const button = getButton('Start Break')
    expect(button).toBeInTheDocument()
    expect(button.parentElement).toBe(form)
  })

  it('has a label saying "Start Break" by default', () => {
    renderEl()
    expect(getButton('Start Break').textContent).toBe('Start Break')
  })

  it('has an expected class name for background color', () => {
    renderEl()
    expect(getButton('Start Break')).toHaveClass('bg-purple-500')
  })

  it('is not disabled when status is "IN-WORK"', () => {
    renderEl("IN-WORK")
    expect(getButton('Start Break')).not.toBeDisabled()
  })

  it('is disabled when status is "IN-BREAK"', () => {
    renderEl("IN-BREAK")
    expect(getButton('Start Break')).toBeDisabled()
  })

  it('is disabled when status is "BEFORE-WORK"', () => {
    renderEl("BEFORE-WORK")
    expect(getButton('Start Break')).toBeDisabled()
  })

  it('is disabled when status is "AFTER-WORK"', () => {
    renderEl("AFTER-WORK")
    expect(getButton('Start Break')).toBeDisabled()
  })

  it('changes label to "Processing" during submission and reverts to "Start Break" when completed', async () => {
    vi.spyOn(actions, 'startBreak').mockResolvedValue()
    renderEl()
    fireEvent.click(getButton('Start Break'))
    expect(getButton('Processing')).toBeInTheDocument()
    expect(actions.startBreak).toBeCalledTimes(1)
    await waitFor(() => expect(getButton('Start Break')).toBeInTheDocument())
  })
})
