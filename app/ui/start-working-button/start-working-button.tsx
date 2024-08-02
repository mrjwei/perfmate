'use client'

import Button from '@/app/ui/button/button'

export default function StartWorkingButton({handleStartWorking, disabled, ...props}: {handleStartWorking: () => void, disabled: boolean}) {
  return (
    <Button type="button" onClick={handleStartWorking} disabled={disabled} name='startWorking' className="bg-lime-600 mr-4">
      Start Working
    </Button>
  )
}
