import { fetchRecordById } from "@/app/lib/api"
import RecordEditForm from '@/app/ui/form/record-edit-form'
import {notFound} from 'next/navigation'

export default async function Page({params}: {params: {id: string}}) {
  const {id} = params
  const record = await fetchRecordById(id)

  if (!record) {
    notFound()
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-12">Edit Record</h2>
      <RecordEditForm record={record} />
    </div>
  )
}
