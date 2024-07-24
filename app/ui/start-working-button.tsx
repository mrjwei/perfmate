'use client'

import Button from '@/app/ui/button'

export default function StartWorkingButton({handleStartWorking, disabled}: {handleStartWorking: () => void, disabled: boolean}) {
  return (
    <Button type="button" onClick={handleStartWorking} disabled={disabled}>
      Start Working
    </Button>
  )
}
