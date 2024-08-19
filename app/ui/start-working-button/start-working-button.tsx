"use client"

import React from "react"
import Button from "@/app/ui/button/button"
import { createRecord } from "@/app/lib/actions"
import {
  getFormattedDateString,
  getFormattedTimeString
} from '@/app/lib/helpers'

export default function StartWorkingButton({
  disabled,
  ...props
}: {
  disabled: boolean
}) {
  const d = new Date()
  const data = {
    date: getFormattedDateString(d),
    starttime: getFormattedTimeString(d)
  }
  const createRecordAction = createRecord.bind(null, data, new FormData())
  return (
    <form action={createRecordAction}>
      <Button
        type="submit"
        disabled={disabled}
        name="startWorking"
        className="text-white bg-lime-600 mr-4"
        {...props}
      >
        Start Working
      </Button>
    </form>
  )
}
