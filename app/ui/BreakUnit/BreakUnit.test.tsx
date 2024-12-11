import React from 'react'
import {describe, it, expect} from 'vitest'
import {render, screen} from '@testing-library/react'
import BreakUnit from '@/app/ui/BreakUnit/BreakUnit';

describe('BreakUnit', () => {
  const renderComp = (index: number) => {
    render(<BreakUnit index={index} starttime="12:00" endtime="13:30" />)
  }
  it('renders an expected index for the break', () => {
    renderComp(1)
    const comp = screen.getByTestId('breakUnit')
    expect(comp).toHaveTextContent('Break 1')
  })
  it('renders an expected index for another break', () => {
    renderComp(2)
    const comp = screen.getByTestId('breakUnit')
    expect(comp).toHaveTextContent('Break 2')
  })
  it('renders two TimeStamp components', () => {
    renderComp(1)
    const timeStamps = screen.getAllByTestId('timeStamp')
    expect(timeStamps).toHaveLength(2)
  })
  it('renders a TimeStamp with a heading saying "Begin"', () => {
    renderComp(1)
    const timeStamps = screen.getAllByTestId('timeStamp')
    expect(timeStamps[0]).toHaveTextContent("Begin")
  });
  it('renders another TimeStamp with a heading saying "End"', () => {
    renderComp(1)
    const timeStamps = screen.getAllByTestId('timeStamp')
    expect(timeStamps[1]).toHaveTextContent("End")
  });
})
