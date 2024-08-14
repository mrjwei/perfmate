"use client"

import React from "react"
import { TrashIcon } from "@heroicons/react/24/outline"
import FormControl from "@/app/ui/form/form-control"
import Button from "@/app/ui/button/button"
import { IGenericBreak } from "@/app/lib/types"

export default function BreakField({
  b,
  index,
  namePrefix,
  handleRemoveBreak,
}: {
  b: IGenericBreak
  index: number
  namePrefix: "existing" | "new"
  handleRemoveBreak: (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => void
}) {
  return (
    <div className="mb-6">
      <label htmlFor={`break${index + 1}`} className="block font-bold mb-4">
        Break {index + 1}
      </label>
      <div id={`break${index + 1}`} className="flex items-center">
        <FormControl
          className="hidden"
          label={`${namePrefix}_breakId`}
          htmlFor={b.id}
        >
          <input
            type="text"
            id={b.id}
            name={`${namePrefix}_breakId`}
            defaultValue={b.id}
            aria-hidden
          />
        </FormControl>
        <FormControl
          label="Start"
          htmlFor={`${namePrefix}_breakStartTime${index + 1}`}
          className="items-center"
          labelClassName="font-bold"
        >
          <input
            type="time"
            id={`${namePrefix}_breakStartTime${index + 1}`}
            name={`${namePrefix}_breakStartTime`}
            defaultValue={b.starttime ? b.starttime : undefined}
            className="border-1 border-slate-400 p-2 mx-4"
          />
        </FormControl>
        <FormControl
          label="End"
          htmlFor={`${namePrefix}_breakEndTime${index + 1}`}
          className="items-center"
          labelClassName="font-bold"
        >
          <input
            type="time"
            id={`${namePrefix}_breakEndTime${index + 1}`}
            name={`${namePrefix}_breakEndTime`}
            defaultValue={b.endtime ? b.endtime : undefined}
            className="border-1 border-slate-400 p-2 mx-4"
          />
        </FormControl>
        <Button
          type="button"
          name={namePrefix}
          onClick={(e) => handleRemoveBreak(e, b.id)}
          className="text-red-500 flex items-center"
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
