"use client"

import React from "react"
import Button from "@/app/ui/button/button"
import { updateBreak } from "@/app/lib/actions"
import { IRecord } from "@/app/lib/types"
import {
  getFormattedTimeString
} from '@/app/lib/helpers'

export default function EndBreakButton({
  record,
  disabled,
  ...props
}: {
  record: IRecord
  disabled: boolean
}) {
  const endtime = getFormattedTimeString(new Date())
  const updateBreakEndTimeWithId = updateBreak.bind(null, {recordId: record.id, endtime}, true)
  return (
    <form action={updateBreakEndTimeWithId}>
      <Button
        type="submit"
        disabled={disabled}
        name="endBreak"
        className="text-white bg-purple-500 mr-4"
        {...props}
      >
        End Break
      </Button>
    </form>
  )
}
