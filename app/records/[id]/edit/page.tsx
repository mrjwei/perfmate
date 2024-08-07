import { fetchRecordById } from "@/app/lib/api"
import RecordEditForm from '@/app/ui/form/record-edit-form'

export default async function Page({params}: {params: {id: string}}) {
  const {id} = params
  const record = await fetchRecordById(id)

  return (
    <div>
      <RecordEditForm record={record} />
    </div>
  )
}
