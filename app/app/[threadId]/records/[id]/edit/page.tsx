import React from 'react'
import { fetchRecordById } from "@/app/lib/api"
import RecordEditForm from '@/app/ui/form/record-edit-form'
import {notFound} from 'next/navigation'

export default async function Page({params}: {params: {threadId: string, id: string}}) {
  const {threadId, id} = params
  const record = await fetchRecordById(id)

  if (!record || record.threadid !== threadId) {
    notFound()
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-12">Edit Record</h2>
      <RecordEditForm record={record} threadId={threadId} />
    </div>
  )
}
