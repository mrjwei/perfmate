'use client'

import React from 'react'
import FormControl from '@/app/ui/form/form-control'
import Button from '@/app/ui/button/button'
import { IBreak, IRecord } from "@/app/lib/types"
import {updateRecord} from '@/app/lib/actions'

export default function RecordEditForm({record}: {record: IRecord}) {
  const breaks = record.breaks

  const updateRecordWithId = updateRecord.bind(null, record.id)

  return (
    <form action={updateRecordWithId}>
      <FormControl label="Date" htmlFor="date">
        <input type="date" id="date" name="date" defaultValue={record.date} />
      </FormControl>
      <FormControl label="Start Time" htmlFor="starttime">
        <input type="time" id="starttime" name="starttime" defaultValue={record.starttime} />
      </FormControl>
      {breaks.map((b: IBreak, i: number) => (
        <div className="flex" key={b.id}>
          <label htmlFor="">Break {i + 1}</label>
          <div>
            <FormControl className="hidden" label="Break Id" htmlFor={`breakBeginTime${i + 1}`}>
              <input type="text" id={b.id} name="breakId" value={b.id} aria-hidden />
            </FormControl>
            <FormControl label="Begin" htmlFor={`breakBeginTime${i + 1}`}>
              <input type="time" id={`breakBeginTime${i + 1}`} name="breakBeginTime" defaultValue={b.starttime} />
            </FormControl>
            <FormControl label="End" htmlFor={`breakEndTime${i + 1}`}>
              <input type="time" id={`breakEndTime${i + 1}`} name="breakEndTime" defaultValue={b.endtime ? b.endtime : undefined} />
            </FormControl>
          </div>
        </div>
      ))}
      <FormControl label="End Time" htmlFor="endtime">
        <input type="time" id="endtime" name="endtime" defaultValue={record.endtime ? record.endtime : undefined} />
      </FormControl>
      <Button type="submit">Submit</Button>
    </form>
  )
}
