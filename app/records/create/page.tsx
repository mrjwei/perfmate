import {Suspense} from 'react'
import RecordCreateForm from '@/app/ui/form/record-create-form'

export default function Page() {
  return (
    <div>
      <Suspense>
        <RecordCreateForm />
      </Suspense>
    </div>
  )
}
