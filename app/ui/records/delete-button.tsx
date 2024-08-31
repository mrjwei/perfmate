"use client"

import React from 'react'
import { TrashIcon } from "@heroicons/react/24/outline"
import Button from '@/app/ui/button/button'
import {deleteRecord} from '@/app/lib/actions'

export default function DeleteButton({id, month}: {id: string | undefined, month?: string}) {
  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      return
    }
    await deleteRecord(id, month)
  }
  return (
    <Button
      className="text-red-500 disabled:bg-transparent disabled:text-slate-300"
      disabled={!id}
      onClick={() => handleDelete(id)}
    >
      <TrashIcon className="w-5" />
    </Button>
  )
}
