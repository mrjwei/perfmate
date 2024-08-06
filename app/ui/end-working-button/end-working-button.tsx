'use client'

import React from 'react'
import Button from '@/app/ui/button/button'

export default function EndWorkingButton({handleEndWorking, disabled}: {handleEndWorking: () => void, disabled: boolean}) {
  return (
    <Button type="button" onClick={handleEndWorking} disabled={disabled} className="text-white bg-red-500">
      End Working
    </Button>
  )
}
