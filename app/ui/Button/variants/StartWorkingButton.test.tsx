import React from 'react'
import {describe, it, afterEach, vi, expect} from 'vitest'
import {render, screen, waitFor, cleanup, fireEvent} from '@testing-library/react'
import StartWorkingButton from './StartWorkingButton'
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
    const button = getButton('Start Working')
    expect(button).toBeInTheDocument()
    expect(button.parentElement).toBe(form)
  })

  it('is not disabled when status is "BEFORE-WORK"', () => {
    renderEl("BEFORE-WORK")
    expect(getButton('Start Working')).not.toBeDisabled()
  })

  it('is disabled when status is not "BEFORE-WORK" ', () => {
    renderEl("IN-WORK")
    expect(getButton('Start Working')).toBeDisabled()
  })

  it('has a label saying "Start Working" by default', () => {
    renderEl()
    expect(getButton('Start Working').textContent).toBe('Start Working')
  })

  it('has an expected class name for background color', () => {
    renderEl()
    expect(getButton('Start Working')).toHaveClass('bg-lime-600')
  })

  it('changes label to "Processing" during submission and reverts to "Start Working" when completed', async () => {
    vi.spyOn(actions, 'startWorking').mockResolvedValue()
    renderEl()
    fireEvent.click(getButton('Start Working'))
    expect(getButton('Processing')).toBeInTheDocument()
    expect(actions.startWorking).toBeCalledTimes(1)
    await waitFor(() => expect(getButton('Start Working')).toBeInTheDocument())
  });
})
