import React, {Suspense} from 'react'
import RecordCreateForm from '@/app/ui/Form/record-create-form'

export default function Page({ params }: { params: { threadId: string } }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-12">Edit Record</h2>
      <Suspense>
        <RecordCreateForm threadId={params.threadId} />
      </Suspense>
    </div>
  )
}
