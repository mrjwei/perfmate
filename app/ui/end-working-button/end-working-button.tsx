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
  record: IRecord
  disabled: boolean
}) {
  // record timestamp on client side to avoid time zone mismatch
  const endtime = getFormattedTimeString(new Date())
  const endWorkingAction = endWorking.bind(null, record.id, endtime)
  return (
    <form action={endWorkingAction}>
      <Button
        type="submit"
        disabled={disabled}
        name="endWorking"
        className="text-white bg-red-500"
        {...props}
      >
        End Working
      </Button>
    </form>
  )
}
