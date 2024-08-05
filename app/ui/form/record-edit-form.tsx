'use client'

import {useActionState} from 'react'
import FormControl from '@/app/ui/form/form-control'
import Button from '@/app/ui/button/button'
import { IBreak, IRecord } from "@/app/lib/types"
import {updateRecord} from '@/app/lib/actions'

export default function RecordEditForm({record}: {record: IRecord}) {
  const breaks = record.breaks

  // const initialState: {
  //   message: string | null
  //   errors: any
  // } = {
  //   message: null,
  //   errors: {}
  // }

  const updateRecordWithId = updateRecord.bind(null, record.id)
  // const [state, formAction] = useActionState(updateRecordWithId, initialState)

  return (
    <form action={updateRecordWithId}>
      <FormControl label="Date" htmlFor="date">
        <input type="date" id="date" name="date" defaultValue={record.date} />
      </FormControl>
      <FormControl label="Start Time" htmlFor="startTime">
        <input type="time" id="startTime" name="startTime" defaultValue={record.startTime}  onChange={() => {}} />
      </FormControl>
      {breaks.map((b: IBreak, i: number) => (
        <div className="flex" key={b.id}>
          <label htmlFor="">Break {i + 1}</label>
          <div>
            <FormControl label="Begin" htmlFor={`breakBeginTime${i + 1}`}>
              <input type="time" id={`breakBeginTime${i + 1}`} name="breakBeginTime" defaultValue={b.startTime} />
            </FormControl>
            <FormControl label="End" htmlFor={`breakEndTime${i + 1}`}>
              <input type="time" id={`breakEndTime${i + 1}`} name="breakEndTime" defaultValue={b.endTime} />
            </FormControl>
          </div>
        </div>
      ))}
      <FormControl label="End Time" htmlFor="endTime">
        <input type="time" id="endTime" name="endTime" defaultValue={record.endTime}  onChange={() => {}} />
      </FormControl>
      <Button type="submit">Submit</Button>
    </form>
  )
}
