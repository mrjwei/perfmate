"use client"

import { revalidatePath } from "next/cache"
import { TrashIcon } from "@heroicons/react/24/outline"
import Button from '@/app/ui/button/button'
import {deleteRecord} from '@/app/lib/actions'

export default function DeleteButton({id}: {id: string | undefined}) {
  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      return
    }
    await deleteRecord(id)
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
