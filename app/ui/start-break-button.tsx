'use client'

import Button from '@/app/ui/button/button'

export default function StartBreakButton({handleStartBreak, disabled}: {handleStartBreak: () => void, disabled: boolean}) {
  return (
    <Button type="button" onClick={handleStartBreak} disabled={disabled}>
      Start Break
    </Button>
  )
}
