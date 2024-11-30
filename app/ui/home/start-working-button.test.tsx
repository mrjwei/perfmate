import React from 'react'
import {describe, it, afterEach, vi, expect} from 'vitest'
import {render, screen, waitFor, cleanup, fireEvent} from '@testing-library/react'
import StartWorkingButton from './start-working-button'
import * as actions from '@/app/lib/actions'

/**
 * This also works
 */
// vi.mock('@/app/lib/actions', () => {
//   return {
//     startWorking: vi.fn(() => Promise.resolve())
//   }
// })

describe('StartWorkingButton', () => {
  const renderEl = (status: string = "BEFORE-WORK") => {
    render(<StartWorkingButton userid="userid" dateStr="2024-11-20" starttimeStr="10:00" disabled={status !== "BEFORE-WORK"} />)
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
    const button = screen.getByRole('button', {name: 'Start Working'})
    expect(button).toBeInTheDocument()
    expect(button.parentElement).toBe(form)
  })

  it('is not disabled initially before work', () => {
    renderEl()
    const button = screen.getByRole('button', {name: 'Start Working'})
    expect(button).not.toBeDisabled()
  })

  it('becomes disabled when status is not "BEFORE-WORK" ', () => {
    renderEl("IN-WORK")
    expect(screen.getByRole('button', {name: 'Start Working'})).toBeDisabled()
  })

  it('has a label saying "Start Working" by default', () => {
    renderEl()
    const button = screen.getByRole('button', {name: 'Start Working'})
    expect(button.textContent).toBe('Start Working')
  })

  it('has an expected class name for background color', () => {
    renderEl()
    const button = screen.getByRole('button', {name: 'Start Working'})
    expect(button).toHaveClass('bg-lime-600')
  })

  it('changes label to "Processing" during submission', async () => {
    vi.spyOn(actions, 'startWorking').mockResolvedValue()
    renderEl()
    const button = screen.getByRole('button', {name: 'Start Working'})
    fireEvent.click(button)
    expect(screen.getByRole('button', { name: 'Processing' })).toBeInTheDocument()
    expect(actions.startWorking).toBeCalledTimes(1)
    await waitFor(() => expect(screen.getByRole('button', {name: 'Start Working'})).toBeInTheDocument())
  });
})
