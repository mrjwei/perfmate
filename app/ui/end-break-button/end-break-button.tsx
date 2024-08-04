'use client'

import Button from '@/app/ui/button/button'

export default function EndBreakButton({handleEndBreak, disabled}: {handleEndBreak: () => void, disabled: boolean}) {
  return (
    <Button type="button" onClick={handleEndBreak} disabled={disabled} className="text-white bg-purple-500 mr-4">
      End Break
    </Button>
  )
}
