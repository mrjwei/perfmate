"use client"

import React, { useState, useActionState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import clsx from "clsx"
import { PlusIcon } from "@heroicons/react/24/outline"
import { v4 as uuidv4 } from "uuid"
import { useSearchParams } from "next/navigation"
import FormControl from "@/app/ui/form/form-control"
import BreakField from "@/app/ui/form/break-field"
import Button from "@/app/ui/common/button/button"
import { IGenericBreak } from "@/app/lib/types"
import { creationForm } from "@/app/lib/actions"
import { dateToMonthStr } from "@/app/lib/helpers"

export default function RecordCreateForm() {
  const { data: session } = useSession()

  const searchParams = useSearchParams()
  const date = searchParams.get("date") as string
  const month = searchParams.get("month") ? searchParams.get("month") : null

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

  const initialState: any = {
    message: "",
    errors: {},
  }

  const creationFormAction = creationForm.bind(null, session?.user.id!, month)
  const [state, formAction, isPending] = useActionState(
    creationFormAction,
    initialState
  )

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
          value={date}
          readOnly
          className="col-span-8 border-1 border-slate-400 bg-slate-100 p-2 mx-4 mb-2"
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
          className={clsx("col-span-8 border-1 p-2 mx-4 mb-2", {
            "border-slate-400": !state.errors?.starttime,
            "border-red-500": state.errors?.starttime,
          })}
          aria-describedby="starttime-error"
        />
        <div
          id="starttime-error"
          className="col-span-12"
          aria-live="polite"
          aria-atomic="true"
        >
          {state.errors?.starttime && (
            <p className="text-red-500" key={state.errors?.starttime.message}>
              {state.errors?.starttime.message}
            </p>
          )}
        </div>
      </FormControl>
      <div
        className={clsx("border-slate-200", {
          "border-y-1 py-8 mb-8": breaks.length > 0,
        })}
      >
        {breaks.map((b, i) => (
          <div className="mb-6" key={b.id}>
            <BreakField
              key={b.id}
              b={b}
              index={i}
              isStarttimeError={state.errors?.breaks?.errors?.find(
                (error: any) =>
                  error.id === b.id && error.fieldName === "starttime"
              )}
              isEndtimeError={state.errors?.breaks?.errors?.find(
                (error: any) =>
                  error.id === b.id && error.fieldName === "endtime"
              )}
              handleRemoveBreak={handleRemoveBreak}
            />
            <div id="break-error" aria-live="polite" aria-atomic="true">
              {state.errors?.breaks &&
                state.errors?.breaks?.errors?.find(
                  (error: any) => error.id === b.id
                ) && (
                  <p className="text-red-500" key={b.id}>
                    {state.errors.breaks.message}
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
          className={clsx("col-span-8 border-1 p-2 mx-4 mb-2", {
            "border-slate-400": !state.errors?.starttime,
            "border-red-500": state.errors?.starttime,
          })}
          aria-describedby="endtime-error"
        />
        <div
          id="endtime-error"
          className="col-span-12"
          aria-live="polite"
          aria-atomic="true"
        >
          {state.errors?.endtime && (
            <p className="text-red-500" key={state.errors?.endtime.message}>
              {state.errors?.endtime.message}
            </p>
          )}
        </div>
      </FormControl>
      <div className="flex items-center">
        <Button type="submit" className="bg-lime-600 text-white mr-4">
          {isPending ? (
            <div className="flex items-center">
              <div className="relative flex justify-center items-center h-6 w-6 mr-2">
                <div className="absolute rounded-full h-6 w-6 border-4 border-white opacity-50"></div>
                <div className="absolute animate-spin rounded-full h-6 w-6 border-4 border-t-white border-transparent"></div>
              </div>
              <span>Processing</span>
            </div>
          ) : (
            "Submit"
          )}
        </Button>
        <Link
          href={`/app/records?month=${dateToMonthStr(new Date(date))}`}
          className="box-border px-4 py-2 font-medium rounded-lg disabled:bg-slate-300 whitespace-nowrap  border-2 border-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
