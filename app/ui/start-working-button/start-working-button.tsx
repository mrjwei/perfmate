"use client"

import React from "react"
import Button from "@/app/ui/button/button"
import { createRecord } from "@/app/lib/actions"

export default function StartWorkingButton({
  disabled,
  ...props
}: {
  disabled: boolean
}) {
  return (
    <form action={createRecord}>
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
