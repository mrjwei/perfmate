'use client'

import React from 'react'
import Button from '@/app/ui/button/button'

export default function StartWorkingButton({handleStartWorking, disabled, ...props}: {handleStartWorking: () => void, disabled: boolean}) {
  return (
    <Button type="button" onClick={handleStartWorking} disabled={disabled} name='startWorking' className="text-white bg-lime-600 mr-4" {...props}>
      Start Working
    </Button>
  )
}
