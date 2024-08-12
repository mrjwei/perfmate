"use client"

import React, { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { useSearchParams } from "next/navigation"
import FormControl from "@/app/ui/form/form-control"
import Button from "@/app/ui/button/button"
import { IBreak, IRecord } from "@/app/lib/types"
import { deleteBreak, updateRecord } from "@/app/lib/actions"

export default function RecordEditForm({ record }: { record: IRecord }) {
  const searchParams = useSearchParams()
  const month = searchParams.get("month")

  const [breaks, setBreaks] = useState<{ id: any; [key: string]: any }[]>(
    record.breaks
  )

  const handleAddBreak = () => {
    setBreaks([...breaks, { id: uuidv4() }])
  }

  const handleRemoveBreak = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    if ((e.target as HTMLButtonElement).name === 'existing') {
      deleteBreak(id)
    }
    const filteredBreaks = breaks.filter(b => b.id !== id)
    setBreaks(filteredBreaks)
  }

  const updateRecordWithId = updateRecord.bind(null, record.id, month)

  return (
    <form action={updateRecordWithId}>
      <FormControl label="Date" htmlFor="date">
        <input type="date" id="date" name="date" defaultValue={record.date} />
      </FormControl>
      <FormControl label="Start Time" htmlFor="starttime">
        <input
          type="time"
          id="starttime"
          name="starttime"
          defaultValue={record.starttime}
        />
      </FormControl>
      {breaks.map((b, i) => {
        if (b.starttime) {
          // existing break
          return (
            <div className="flex" key={b.id}>
              <label htmlFor="">Break {i + 1}</label>
              <div>
                <FormControl className="hidden" label="Existing Break Id" htmlFor={b.id}>
                  <input
                    type="text"
                    id={b.id}
                    name="existing_breakId"
                    defaultValue={b.id}
                    aria-hidden
                  />
                </FormControl>
                <FormControl label="Start" htmlFor={`existing_breakStartTime${i + 1}`}>
                  <input
                    type="time"
                    id={`existing_breakStartTime${i + 1}`}
                    name="existing_breakStartTime"
                    defaultValue={b.starttime}
                  />
                </FormControl>
                <FormControl label="End" htmlFor={`existing_breakEndTime${i + 1}`}>
                  <input
                    type="time"
                    id={`existing_breakEndTime${i + 1}`}
                    name="existing_breakEndTime"
                    defaultValue={b.endtime ? b.endtime : undefined}
                  />
                </FormControl>
              </div>
              <Button type="button" name={b.starttime ? 'existing' : 'new'} onClick={(e) => handleRemoveBreak(e, b.id)}>
                Remove break
              </Button>
            </div>
          )
        } else {
          // new break
          return (
            <div className="flex" key={b.id}>
              <label htmlFor="">Break {i + 1}</label>
              <div>
                <FormControl className="hidden" label="New Break Id" htmlFor={b.id}>
                  <input
                    type="text"
                    id={b.id}
                    name="new_breakId"
                    defaultValue={b.id}
                    aria-hidden
                  />
                </FormControl>
                <FormControl label="Start" htmlFor={`new_breakStartTime${i + 1}`}>
                  <input
                    type="time"
                    id={`new_breakStartTime${i + 1}`}
                    name="new_breakStartTime"
                  />
                </FormControl>
                <FormControl label="End" htmlFor={`new_breakEndTime${i + 1}`}>
                  <input
                    type="time"
                    id={`new_breakEndTime${i + 1}`}
                    name="new_breakEndTime"
                  />
                </FormControl>
              </div>
              <Button type="button" name={b.starttime ? 'existing' : 'new'} onClick={(e) => handleRemoveBreak(e, b.id)}>
                Remove break
              </Button>
            </div>
          )
        }
      })}
      <Button type="button" onClick={handleAddBreak}>
        Add break
      </Button>
      <FormControl label="End Time" htmlFor="endtime">
        <input
          type="time"
          id="endtime"
          name="endtime"
          defaultValue={record.endtime ? record.endtime : undefined}
        />
      </FormControl>
      <Button type="submit">Submit</Button>
    </form>
  )
}
