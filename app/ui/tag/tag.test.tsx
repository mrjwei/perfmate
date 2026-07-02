import React from 'react'
import {describe, it, expect} from 'vitest'
import {render, screen} from '@testing-library/react'
import Tag from '@/app/ui/tag/tag';
import { TStatus } from "@/app/lib/types"

describe('Tag', () => {
  const renderEl = (children: TStatus = "BEFORE-WORK") => {
    render(<Tag testid="tag">{children}</Tag>)
  }

  it('renders text "Ready to Start" when status is "BEFORE-WORK"', () => {
    renderEl("BEFORE-WORK")
    const tag = screen.getByTestId("tag")
    expect(tag).toHaveTextContent("Ready to Start")
    expect(tag).toHaveClass("text-muted-foreground")
  })
  it('renders text "At Work" when status is "IN-WORK"', () => {
    renderEl("IN-WORK")
    const tag = screen.getByTestId("tag")
    expect(tag).toHaveTextContent("At Work")
    expect(tag).toHaveClass("text-success")
  })
  it('renders text "On Break" when status is "IN-BREAK"', () => {
    renderEl("IN-BREAK")
    const tag = screen.getByTestId("tag")
    expect(tag).toHaveTextContent("On Break")
    expect(tag).toHaveClass("text-warning")
  })
  it('renders text "Work Over" when status is "AFTER-WORK"', () => {
    renderEl("AFTER-WORK")
    const tag = screen.getByTestId("tag")
    expect(tag).toHaveTextContent("Work Over")
    expect(tag).toHaveClass("text-destructive")
  })
})
