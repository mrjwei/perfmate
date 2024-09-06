"use client"

import React from "react"
import Button from "@/app/ui/button/button"
import { endWorking } from "@/app/lib/actions"
import { IRecord } from "@/app/lib/types"
import {
  getFormattedTimeString
} from '@/app/lib/helpers'

export default function EndWorkingButton({
  record,
  disabled,
  ...props
}: {
  record: IRecord | null
  disabled: boolean
}) {
  // record timestamp on client side to avoid time zone mismatch
  const endtime = getFormattedTimeString(new Date())

  let recordId

  if (!record) {
    recordId = null
  } else {
    recordId = record.id
  }

  const endWorkingAction = endWorking.bind(null, recordId, endtime)
  return (
    <form action={endWorkingAction}>
      <Button
        type="submit"
        disabled={disabled}
        name="endWorking"
        className="w-full text-white bg-red-500"
        {...props}
      >
        End Working
      </Button>
    </form>
  )
}
