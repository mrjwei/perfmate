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
  record: IRecord | null
  disabled: boolean
}) {
  const starttime = getFormattedTimeString(new Date())

  let recordId

  if (!record) {
    recordId = null
  } else {
    recordId = record.id
  }

  const startBreakAction = startBreak.bind(null, recordId, starttime)
  return (
    <form action={startBreakAction}>
      <Button
        type="submit"
        disabled={disabled}
        name="startBreak"
        className="w-full text-white bg-purple-500 mr-4"
        {...props}
      >
        Start Break
      </Button>
    </form>
  )
}
