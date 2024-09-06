"use client"

import React from "react"
import Button from "@/app/ui/button/button"
import { endBreak } from "@/app/lib/actions"
import { IRecord } from "@/app/lib/types"
import {
  getFormattedTimeString
} from '@/app/lib/helpers'

export default function EndBreakButton({
  record,
  disabled,
  ...props
}: {
  record: IRecord | null
  disabled: boolean
}) {
  const endtime = getFormattedTimeString(new Date())

  let recordId

  if (!record) {
    recordId = null
  } else {
    recordId = record.id
  }

  const endBreakAction = endBreak.bind(null, recordId, endtime)
  return (
    <form action={endBreakAction}>
      <Button
        type="submit"
        disabled={disabled}
        name="endBreak"
        className="w-full text-white bg-purple-500 mr-4"
        {...props}
      >
        End Break
      </Button>
    </form>
  )
}
