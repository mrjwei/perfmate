import React from 'react'
import {describe, it, afterEach, vi, expect} from 'vitest'
import {render, screen, waitFor, cleanup, fireEvent} from '@testing-library/react'
import EndWorkingButton from './end-working-button'
import * as actions from '@/app/lib/actions'

describe('EndWorkingButton', () => {
  const renderEl = (status: string = "IN-WORK") => {
    render(<EndWorkingButton record={null} endtimeStr="18:00" disabled={status === "BEFORE-WORK" || status === "AFTER-WORK"} />)
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
    const button = getButton('End Working')
    expect(button).toBeInTheDocument()
    expect(button.parentElement).toBe(form)
  })

  it('is not disabled when status is "IN-WORK"', () => {
    renderEl("IN-WORK")
    expect(getButton('End Working')).not.toBeDisabled()
  })

  it('is not disabled when status is "IN-BREAK"', () => {
    renderEl("IN-BREAK")
    expect(getButton('End Working')).not.toBeDisabled()
  })

  it('is disabled when status is "BEFORE-WORK"', () => {
    renderEl("BEFORE-WORK")
    expect(getButton('End Working')).toBeDisabled()
  })

  it('is disabled when status is "AFTER-WORK"', () => {
    renderEl("AFTER-WORK")
    expect(getButton('End Working')).toBeDisabled()
  })

  it('has a label saying "End Working" by default', () => {
    renderEl()
    expect(getButton('End Working').textContent).toBe('End Working')
  })

  it('has an expected class name for background color', () => {
    renderEl()
    expect(getButton('End Working')).toHaveClass('bg-red-500')
  })

  it('changes label to "Processing" during submission and reverts to "End Working" when completed', async () => {
    vi.spyOn(actions, 'endWorking').mockResolvedValue()
    renderEl()
    fireEvent.click(getButton('End Working'))
    expect(getButton('Processing')).toBeInTheDocument()
    expect(actions.endWorking).toBeCalledTimes(1)
    await waitFor(() => expect(getButton('End Working')).toBeInTheDocument())
  });
})
