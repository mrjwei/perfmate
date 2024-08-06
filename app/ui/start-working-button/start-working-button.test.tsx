import React from 'react'
import {describe, it, afterEach, vi, expect, Mock} from 'vitest'
import {render, screen, fireEvent, act, waitFor, cleanup} from '@testing-library/react'
import StartWorkingButton from './start-working-button'

describe('Start working button', () => {
  let handleStartWorkingMock: () => Mock

  const renderEl = (fn: () => void, disabled: boolean) => {
    render(<StartWorkingButton handleStartWorking={fn} disabled={disabled} />)
  }

  let button: HTMLElement

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it('renders in document', () => {
    handleStartWorkingMock = vi.fn()
    renderEl(handleStartWorkingMock, false)
    button = screen.getByRole('button', {name: 'Start Working'})
    expect(button).toBeInTheDocument()
  })
  it('renders the correct label', () => {
    handleStartWorkingMock = vi.fn()
    renderEl(handleStartWorkingMock, false)
    button = screen.getByRole('button', {name: 'Start Working'})
    expect(button.textContent).toBe('Start Working')
  })
  it('should call handleStartWorking when clicked', async () => {
    handleStartWorkingMock = vi.fn()
    renderEl(handleStartWorkingMock, false)
    button = screen.getByRole('button', {name: 'Start Working'})
    await act(async () => {
      await waitFor(() => {
        fireEvent.click(button)
        expect(handleStartWorkingMock).toHaveBeenCalled()
      })
    })
  })
  it('should update status to IN-WORK', async () => {

  })
})
