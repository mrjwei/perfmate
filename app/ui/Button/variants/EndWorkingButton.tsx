"use client"

import React, {useActionState} from "react"
import Button from "@/app/ui/Button/Button"
import { endWorking } from "@/app/lib/actions"
import { IRecord } from "@/app/lib/types"

export default function EndWorkingButton({
  record,
  disabled,
  endtimeStr,
  ...props
}: {
  record: IRecord | null
  disabled: boolean
  endtimeStr: string
}) {
  let recordId

  if (!record) {
    recordId = null
  } else {
    recordId = record.id
  }

  const endWorkingAction = endWorking.bind(null, recordId, endtimeStr)
  const [state, formAction, isPending] = useActionState(endWorkingAction, null)
  return (
    <form action={formAction}>
      <Button
        type="submit"
        disabled={disabled}
        name="endWorking"
        className="w-full text-white bg-red-500"
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
          "End Working"
        )}
      </Button>
    </form>
  )
}
