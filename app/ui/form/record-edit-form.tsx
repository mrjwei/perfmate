"use client"

import React, { useState, useActionState } from "react"
import Link from "next/link"
import clsx from 'clsx'
import { PlusIcon } from "@heroicons/react/24/outline"
import { v4 as uuidv4 } from "uuid"
import { useSearchParams } from "next/navigation"
import FormControl from "@/app/ui/form/form-control"
import BreakField from "@/app/ui/form/break-field"
import Button from "@/app/ui/button/button"
import { IGenericBreak, IRecord } from "@/app/lib/types"
import { deleteBreak, updateRecord } from "@/app/lib/actions"

export default function RecordEditForm({ record }: { record: IRecord }) {
  const searchParams = useSearchParams()
  const month = searchParams.get("month")

  const [breaks, setBreaks] = useState<IGenericBreak[]>(record.breaks)

  const handleAddBreak = () => {
    setBreaks([...breaks, { id: uuidv4() }])
  }

  const handleRemoveBreak = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    if ((e.currentTarget as HTMLButtonElement).name === "existing") {
      deleteBreak(id)
    }
    const filteredBreaks = breaks.filter((b) => b.id !== id)
    setBreaks(filteredBreaks)
  }

  const updateRecordAction = updateRecord.bind(null, record.id, month, undefined)
  const initialState: any = {
    message: '',
    errors: {}
  }
  const [state, formAction] = useActionState(updateRecordAction, initialState)

  return (
    <form action={formAction}>
      <FormControl
        label="Date"
        htmlFor="date"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <input
          type="date"
          id="date"
          name="date"
          defaultValue={record.date}
          className={clsx(
            'col-span-8 border-1 p-2 mx-4 mb-2',
            {
              'border-slate-400': !state.errors?.date,
              'border-red-500': state.errors?.date
            }
          )}
          aria-describedby="date-error"
        />
        <div id="date-error" className="col-span-12" aria-live="polite" aria-atomic="true">
          {state.errors?.date && (
            <p className="text-red-500" key={state.errors.date.message}>
              {state.errors.date.message}
            </p>
          )}
        </div>
      </FormControl>
      <FormControl
        label="Start Time"
        htmlFor="starttime"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <input
          type="time"
          id="starttime"
          name="starttime"
          defaultValue={record.starttime}
          className={clsx(
            'col-span-8 border-1 p-2 mx-4 mb-2',
            {
              'border-slate-400': !state.errors?.starttime,
              'border-red-500': state.errors?.starttime
            }
          )}
          aria-describedby="starttime-error"
        />
        <div id="starttime-error" className="col-span-12" aria-live="polite" aria-atomic="true">
          {state.errors?.starttime && (
            <p className="text-red-500" key={state.errors?.starttime.message}>
              {state.errors?.starttime.message}
            </p>
          )}
        </div>
      </FormControl>
      <div className={clsx(
        'border-slate-200',
        {
          'border-y-1 py-8 mb-8': breaks.length > 0
        }
      )}>
        {breaks.map((b, i) => (
          <div className="mb-6">
            <BreakField
              key={b.id}
              b={b}
              index={i}
              namePrefix={b.starttime ? "existing" : "new"}
              handleRemoveBreak={handleRemoveBreak}
              showErrorStyleStartTime={state.errors?.existingBreaks && state.errors?.existingBreaks.indexTuples.find((t: Array<number | undefined>) => t[0] === i && t[1] === 0) || state.errors?.newBreaks && state.errors?.newBreaks.indexTuples.find((t: Array<number | undefined>) => t[0] === i && t[1] === 0)}
              showErrorStyleEndTime={state.errors?.existingBreaks && state.errors?.existingBreaks.indexTuples.find((t: Array<number | undefined>) => t[0] === i && t[1] === 1) || state.errors?.newBreaks && state.errors?.newBreaks.indexTuples.find((t: Array<number | undefined>) => t[0] === i && t[1] === 1)}
            />
            <div id='break-error' aria-live="polite" aria-atomic="true">
              {state.errors?.existingBreaks && state.errors?.existingBreaks.indexTuples.find((t: [number | undefined]) => t[0] === i) && (
                <p className="text-red-500" key={b.id}>
                  {state.errors.existingBreaks.message}
                </p>
              )}
              {state.errors?.newBreaks && state.errors?.newBreaks.indexTuples.find((t: [number | undefined]) => t[0] === i) && (
                <p className="text-red-500" key={b.id}>
                  {state.errors.newBreaks.message}
                </p>
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          onClick={handleAddBreak}
          className="text-lime-600 flex items-center -ml-4"
        >
          <span className="mr-2">
            <PlusIcon className="w-6" />
          </span>
          <span>Add break</span>
        </Button>
      </div>
      <FormControl
        label="End Time"
        htmlFor="endtime"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <input
          type="time"
          id="endtime"
          name="endtime"
          defaultValue={record.endtime ? record.endtime : undefined}
          className={clsx(
            'col-span-8 border-1 p-2 mx-4 mb-2',
            {
              'border-slate-400': !state.errors?.endtime,
              'border-red-500': state.errors?.endtime
            }
          )}
          aria-describedby="endtime-error"
        />
        <div id="endtime-error" className="col-span-12" aria-live="polite" aria-atomic="true">
          {state.errors?.endtime && (
            <p className="text-red-500" key={state.errors?.endtime.message}>
              {state.errors?.endtime.message}
            </p>
          )}
        </div>
      </FormControl>
      <div className="flex items-center">
        <Button type="submit" className="bg-lime-600 text-white mr-4">
          Submit
        </Button>
        <Link
          href={`/records?month=${month}`}
          className="box-border px-4 py-2 font-medium rounded-lg disabled:bg-slate-300 whitespace-nowrap  border-2 border-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
