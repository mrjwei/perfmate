"use client"

import React from "react"
import Button from "@/app/ui/button/button"
import { createBreak } from "@/app/lib/actions"
import { IRecord } from "@/app/lib/types"

export default function StartBreakButton({
  record,
  disabled,
  ...props
}: {
  record: IRecord
  disabled: boolean
}) {
  const updateRecordEndTimeWithId = createBreak.bind(null, record.id)
  return (
    <form action={updateRecordEndTimeWithId}>
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
