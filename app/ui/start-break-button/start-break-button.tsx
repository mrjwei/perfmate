'use client'

import React from 'react'
import Button from '@/app/ui/button/button'

export default function StartBreakButton({handleStartBreak, disabled}: {handleStartBreak: () => void, disabled: boolean}) {
  return (
    <Button type="button" onClick={handleStartBreak} disabled={disabled} className="text-white bg-purple-500 mr-4">
      Start Break
    </Button>
  )
}
