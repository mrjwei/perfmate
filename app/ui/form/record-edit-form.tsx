"use client"

import React, { useState } from "react"
import Link from "next/link"
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

  const updateRecordWithId = updateRecord.bind(null, record.id, month)

  return (
    <form action={updateRecordWithId}>
      <FormControl
        label="Date"
        htmlFor="date"
        className="items-center mb-8"
        labelClassName="font-bold"
      >
        <input
          type="date"
          id="date"
          name="date"
          defaultValue={record.date}
          className="border-1 border-slate-400 p-2 mx-4"
        />
      </FormControl>
      <FormControl
        label="Start Time"
        htmlFor="starttime"
        className="items-center mb-8"
        labelClassName="font-bold"
      >
        <input
          type="time"
          id="starttime"
          name="starttime"
          defaultValue={record.starttime}
          className="border-1 border-slate-400 p-2 mx-4"
        />
      </FormControl>
      <div className="border-y-1 border-slate-200 py-8 mb-8">
        {breaks.map((b, i) => {
          return (
            <BreakField
              key={b.id}
              b={b}
              index={i}
              namePrefix={b.starttime ? "existing" : "new"}
              handleRemoveBreak={handleRemoveBreak}
            />
          )
        })}
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
        labelClassName="font-bold"
      >
        <input
          type="time"
          id="endtime"
          name="endtime"
          defaultValue={record.endtime ? record.endtime : undefined}
          className="border-1 border-slate-400 p-2 mx-4"
        />
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
