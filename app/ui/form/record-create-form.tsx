'use client'

import React, { useState } from 'react'
import {v4 as uuidv4} from 'uuid'
import {useSearchParams} from 'next/navigation'
import FormControl from '@/app/ui/form/form-control'
import Button from '@/app/ui/button/button'
import { IBreak, IRecord } from "@/app/lib/types"
import {createFullRecord} from '@/app/lib/actions'

export default function RecordCreateForm() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') as string

  const [breaks, setBreaks] = useState<{id: any}[]>([]);

  return (
    <form action={createFullRecord}>
      <FormControl label="Date" htmlFor="date">
        <input type="date" id="date" name="date" defaultValue={date} />
      </FormControl>
      <FormControl label="Start Time" htmlFor="starttime">
        <input type="time" id="starttime" name="starttime" />
      </FormControl>
      {breaks.map((b, i) => (
        <div className="flex" key={b.id}>
          <label htmlFor="">Break {i + 1}</label>
          <div>
            <FormControl label="Begin" htmlFor={`breakBeginTime${i + 1}`}>
              <input type="time" id={`breakBeginTime${i + 1}`} name="breakBeginTime" />
            </FormControl>
            <FormControl label="End" htmlFor={`breakEndTime${i + 1}`}>
              <input type="time" id={`breakEndTime${i + 1}`} name="breakEndTime" />
            </FormControl>
          </div>
        </div>
      ))}
      <FormControl label="End Time" htmlFor="endtime">
        <input type="time" id="endtime" name="endtime" />
      </FormControl>
      <Button type="submit">Submit</Button>
    </form>
  )
}
