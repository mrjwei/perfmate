import React from 'react'
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  test('exists in document', () => {
    render(<Button>test button</Button>)
    const el = screen.getByText('test button')
    expect(el).toBeInTheDocument()
    expect(el.tagName).toBe('BUTTON')
  })
});

