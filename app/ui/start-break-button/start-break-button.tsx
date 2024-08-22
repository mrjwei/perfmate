"use client"

import React from "react"
import Button from "@/app/ui/button/button"
import { startBreak } from "@/app/lib/actions"
import { IRecord } from "@/app/lib/types"
import {
  getFormattedTimeString
} from '@/app/lib/helpers'

export default function StartBreakButton({
  record,
  disabled,
  ...props
}: {
  record: IRecord
  disabled: boolean
}) {
  const starttime = getFormattedTimeString(new Date())
  const startBreakAction = startBreak.bind(null, record.id, starttime)
  return (
    <form action={startBreakAction}>
      <Button
        type="submit"
        disabled={disabled}
        name="startBreak"
        className="text-white bg-purple-500 mr-4"
        {...props}
      >
        Start Break
      </Button>
    </form>
  )
}
