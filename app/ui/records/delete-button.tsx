"use client"

import React, { useState } from "react"
import { TrashIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { deleteRecord } from "@/app/lib/actions"

export default function DeleteButton({
  threadId,
  id,
  month,
}: {
  threadId: string
  id: string | undefined
  month?: string
}) {
  const [isPending, setIsPending] = useState(false)
  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      return
    }
    setIsPending(true)
    await deleteRecord(threadId, id, month)
    setIsPending(false)
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive disabled:bg-transparent disabled:text-muted-foreground"
      disabled={!id}
      onClick={() => handleDelete(id)}
    >
      {isPending ? (
        <div className="flex items-center">
          <div className="relative flex justify-center items-center h-5 w-5">
            <div className="absolute rounded-full h-5 w-5 border-4 border-muted-foreground opacity-50"></div>
            <div className="absolute animate-spin rounded-full h-5 w-5 border-4 border-t-muted-foreground border-transparent"></div>
          </div>
        </div>
      ) : (
        <TrashIcon className="w-5" />
      )}
    </Button>
  )
}
