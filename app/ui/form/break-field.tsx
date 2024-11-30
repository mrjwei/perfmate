"use client"

import React from "react"
import { TrashIcon } from "@heroicons/react/24/outline"
import FormControl from "@/app/ui/form/form-control"
import Button from "@/app/ui/common/button/button"
import { IGenericBreak } from "@/app/lib/types"
import clsx from "clsx"

export default function BreakField({
  b,
  index,
  isStarttimeError,
  isEndtimeError,
  handleRemoveBreak,
}: {
  b: IGenericBreak
  index: number
  isStarttimeError: boolean,
  isEndtimeError: boolean,
  handleRemoveBreak: (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => void
}) {
  return (
    <div className="mb-2">
      <label htmlFor={`break${index + 1}`} className="block font-bold mb-4">
        Break {index + 1}
      </label>
      <div id={`break${index + 1}`} className="grid grid-cols-12 gap:4 lg:gap-8">
        <FormControl
          className="hidden"
          label='Break Id'
          htmlFor={b.id}
        >
          <input
            type="text"
            id={b.id}
            name='breakid'
            value={b.id}
            readOnly
            aria-hidden
          />
        </FormControl>
        <FormControl
          label="Start"
          htmlFor={`breakstarttime-${index + 1}`}
          className="items-center col-span-5"
          labelClassName="col-span-2 font-bold"
        >
          <input
            type="time"
            id={`breakstarttime-${index + 1}`}
            name='breakstarttime'
            defaultValue={b.starttime ? b.starttime : undefined}
            className={clsx(
              "col-span-10 border-1 p-2",
              {
                'border-slate-400': !isStarttimeError,
                'border-red-500': isStarttimeError,
              }
            )}
            aria-describedby="break-error"
          />
        </FormControl>
        <FormControl
          label="End"
          htmlFor={`breakendtime-${index + 1}`}
          className="items-center col-span-5"
          labelClassName="col-span-2 font-bold"
        >
          <input
            type="time"
            id={`breakendtime-${index + 1}`}
            name='breakendtime'
            defaultValue={b.endtime ? b.endtime : undefined}
            className={clsx(
              "col-span-10 border-1 p-2",
              {
                'border-slate-400': !isEndtimeError,
                'border-red-500': isEndtimeError,
              }
            )}
            aria-describedby="break-error"
          />
        </FormControl>
        <Button
          type="button"
          onClick={(e) => handleRemoveBreak(e, b.id)}
          name={b.starttime ? 'existing' : 'new'}
          className="col-span-2 text-red-500 flex items-center"
        >
          <span className="mr-2">
            <TrashIcon className="w-6" />
          </span>
          <span>Delete</span>
        </Button>
      </div>
    </div>
  )
}
