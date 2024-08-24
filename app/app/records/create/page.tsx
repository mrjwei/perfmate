import {Suspense} from 'react'
import RecordCreateForm from '@/app/ui/form/record-create-form'

export default function Page() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-12">Edit Record</h2>
      <Suspense>
        <RecordCreateForm />
      </Suspense>
    </div>
  )
}
