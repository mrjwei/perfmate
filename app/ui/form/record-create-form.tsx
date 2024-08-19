"use client"

import React, { useState } from "react"
import Link from "next/link"
import clsx from "clsx"
import { PlusIcon } from "@heroicons/react/24/outline"
import { v4 as uuidv4 } from "uuid"
import { useSearchParams } from "next/navigation"
import FormControl from "@/app/ui/form/form-control"
import BreakField from "@/app/ui/form/break-field"
import Button from "@/app/ui/button/button"
import { IGenericBreak } from "@/app/lib/types"
import { createRecord } from "@/app/lib/actions"
import { dateToMonthStr } from "@/app/lib/helpers"

export default function RecordCreateForm() {
  const searchParams = useSearchParams()
  const date = searchParams.get("date") as string

  const [breaks, setBreaks] = useState<IGenericBreak[]>([])

  const handleAddBreak = () => {
    setBreaks([...breaks, { id: uuidv4() }])
  }

  const handleRemoveBreak = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    if (breaks.length === 0) {
      return
    }
    const filteredBreaks = breaks.filter((b) => b.id !== id)
    setBreaks(filteredBreaks)
  }

  const createRecordAction = createRecord.bind(null, undefined)

  return (
    <form action={createRecordAction}>
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
          defaultValue={date}
          className="col-span-8 border-1 border-slate-400 p-2"
        />
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
          className="col-span-8 border-1 border-slate-400 p-2"
        />
      </FormControl>
      <div
        className={clsx("border-slate-200", {
          "border-y-1 py-8 mb-8": breaks.length > 0,
        })}
      >
        {breaks.map((b, i) => (
          <BreakField
            key={b.id}
            b={b}
            index={i}
            namePrefix="new"
            handleRemoveBreak={handleRemoveBreak}
          />
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
          className="col-span-8 border-1 border-slate-400 p-2"
        />
      </FormControl>
      <div className="flex items-center">
        <Button type="submit" className="bg-lime-600 text-white mr-4">
          Submit
        </Button>
        <Link
          href={`/records?month=${dateToMonthStr(new Date(date))}`}
          className="box-border px-4 py-2 font-medium rounded-lg disabled:bg-slate-300 whitespace-nowrap  border-2 border-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
