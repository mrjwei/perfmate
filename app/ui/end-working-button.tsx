'use client'

import Button from '@/app/ui/button/button'

export default function EndWorkingButton({handleEndWorking, disabled}: {handleEndWorking: () => void, disabled: boolean}) {
  return (
    <Button type="button" onClick={handleEndWorking} disabled={disabled}>
      End Working
    </Button>
  )
}
