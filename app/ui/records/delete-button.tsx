"use client"

import React, { useState } from "react"
import { TrashIcon } from "@heroicons/react/24/outline"
import Button from "@/app/ui/Button/Button"
import { deleteRecord } from "@/app/lib/actions"

export default function DeleteButton({
  id,
  month,
}: {
  id: string | undefined
  month?: string
}) {
  const [isPending, setIsPending] = useState(false)
  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      return
    }
    setIsPending(true)
    await deleteRecord(id, month)
    setIsPending(false)
  }
  return (
    <Button
      className="text-red-500 disabled:bg-transparent disabled:text-slate-300"
      disabled={!id}
      onClick={() => handleDelete(id)}
    >
      {isPending ? (
        <div className="flex items-center">
          <div className="relative flex justify-center items-center h-5 w-5">
            <div className="absolute rounded-full h-5 w-5 border-4 border-gray-300 opacity-50"></div>
            <div className="absolute animate-spin rounded-full h-5 w-5 border-4 border-t-gray-300 border-transparent"></div>
          </div>
        </div>
      ) : (
        <TrashIcon className="w-5" />
      )}
    </Button>
  )
}
