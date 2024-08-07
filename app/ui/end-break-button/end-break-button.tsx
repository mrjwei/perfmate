"use client"

import React from "react"
import Button from "@/app/ui/button/button"
import { updateBreakEndTime } from "@/app/lib/actions"
import { IRecord } from "@/app/lib/types"

export default function EndBreakButton({
  record,
  disabled,
  ...props
}: {
  record: IRecord
  disabled: boolean
}) {
  const updateBreakEndTimeWithId = updateBreakEndTime.bind(null, record.id)
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
