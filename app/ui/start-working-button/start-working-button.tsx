"use client"

import React, {useActionState} from "react"
import Button from "@/app/ui/button/button"
import { startWorking } from "@/app/lib/actions"
import {
  getFormattedDateString,
  getFormattedTimeString
} from '@/app/lib/helpers'

export default function StartWorkingButton({
  userid,
  disabled,
  ...props
}: {
  userid: string
  disabled: boolean
}) {
  const d = new Date()
  const date = getFormattedDateString(d)
  const starttime = getFormattedTimeString(d)
  const startWorkingAction = startWorking.bind(null, userid, date, starttime)
  const [state, formAction, isPending] = useActionState(startWorkingAction, null)
  return (
    <form action={formAction}>
      <Button
        type="submit"
        disabled={disabled}
        name="startWorking"
        className="w-full text-white bg-lime-600 mr-4"
        {...props}
      >
        {isPending ? (
          <div className="flex items-center">
            <div className="relative flex justify-center items-center h-6 w-6 mr-2">
              <div className="absolute rounded-full h-6 w-6 border-4 border-white opacity-50"></div>
              <div className="absolute animate-spin rounded-full h-6 w-6 border-4 border-t-white border-transparent"></div>
            </div>
            <span>Processing</span>
          </div>
        ) : (
          "Start Working"
        )}
      </Button>
    </form>
  )
}
