import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './button'

test('Button', () => {
  render(<Button children="test button" />)
  const el = screen.getByText('test button')
  expect(el).toBeInTheDocument()
  expect(el.tagName).toBe('BUTTON')
})

