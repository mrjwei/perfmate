"use client"

import React from "react"
import { TrashIcon } from "@heroicons/react/24/outline"
import FormControl from "@/app/ui/form/form-control"
import Button from "@/app/ui/button/button"
import { IGenericBreak } from "@/app/lib/types"
import clsx from "clsx"

export default function BreakField({
  b,
  index,
  namePrefix,
  handleRemoveBreak,
  showErrorStyleStartTime,
  showErrorStyleEndTime,
}: {
  b: IGenericBreak
  index: number
  namePrefix: "existing" | "new"
  handleRemoveBreak: (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => void
  showErrorStyleStartTime?: boolean
  showErrorStyleEndTime?: boolean
}) {
  return (
    <div className="mb-2">
      <label htmlFor={`break${index + 1}`} className="block font-bold mb-4">
        Break {index + 1}
      </label>
      <div id={`break${index + 1}`} className="grid grid-cols-12 gap:4 lg:gap-8">
        <FormControl
          className="hidden"
          label={`${namePrefix}_breakId`}
          htmlFor={b.id}
        >
          <input
            type="text"
            id={b.id}
            name={`${namePrefix}_breakId`}
            value={b.id}
            readOnly
            aria-hidden
          />
        </FormControl>
        <FormControl
          label="Start"
          htmlFor={`${namePrefix}_breakStartTime${index + 1}`}
          className="items-center col-span-5"
          labelClassName="col-span-2 font-bold"
        >
          <input
            type="time"
            id={`${namePrefix}_breakStartTime${index + 1}`}
            name={`${namePrefix}_breakStartTime`}
            defaultValue={b.starttime ? b.starttime : undefined}
            className={clsx(
              "col-span-10 border-1 p-2",
              {
                'border-slate-400': !showErrorStyleStartTime,
                'border-red-500': showErrorStyleStartTime
              }
            )}
            aria-describedby="break-error"
          />
        </FormControl>
        <FormControl
          label="End"
          htmlFor={`${namePrefix}_breakEndTime${index + 1}`}
          className="items-center col-span-5"
          labelClassName="col-span-2 font-bold"
        >
          <input
            type="time"
            id={`${namePrefix}_breakEndTime${index + 1}`}
            name={`${namePrefix}_breakEndTime`}
            defaultValue={b.endtime ? b.endtime : undefined}
            className={clsx(
              "col-span-10 border-1 p-2",
              {
                'border-slate-400': !showErrorStyleEndTime,
                'border-red-500': showErrorStyleEndTime
              }
            )}
            aria-describedby="break-error"
          />
        </FormControl>
        <Button
          type="button"
          name={namePrefix}
          onClick={(e) => handleRemoveBreak(e, b.id)}
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
