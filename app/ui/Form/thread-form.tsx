"use client"

import React, { useActionState } from "react"
import clsx from "clsx"
import FormControl from "@/app/ui/Form/form-control"
import Button from "@/app/ui/Button/Button"
import { createThreadForm, updateThreadForm } from "@/app/lib/actions"
import { IThread, TActionState } from "@/app/lib/types"

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
]

export default function ThreadForm({ thread }: { thread?: IThread }) {
  const action = thread ? updateThreadForm.bind(null, thread.id) : createThreadForm
  const initialState: TActionState = { message: "", errors: {} }
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <form action={formAction}>
      <FormControl
        label="Name"
        htmlFor="name"
        className="items-center mb-6"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={thread?.name}
          placeholder="e.g. Acme Corp, Freelance Design"
          className={clsx("col-span-12 border-1 p-2", {
            "border-slate-400": !state.errors?.name,
            "border-red-500": state.errors?.name,
          })}
          required
        />
      </FormControl>
      <FormControl
        label="Hourly wage"
        htmlFor="hourlywage"
        className="items-center mb-6"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <input
          type="number"
          id="hourlywage"
          name="hourlywage"
          step={10}
          defaultValue={thread?.hourlywage}
          className={clsx("col-span-12 border-1 p-2", {
            "border-slate-400": !state.errors?.hourlywage,
            "border-red-500": state.errors?.hourlywage,
          })}
          required
        />
      </FormControl>
      <FormControl
        label="Currency"
        htmlFor="currency"
        className="items-center mb-6"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <select
          name="currency"
          id="currency"
          defaultValue={thread?.currency ?? ""}
          className={clsx("col-span-12 border-1 p-2", {
            "border-slate-400": !state.errors?.currency,
            "border-red-500": state.errors?.currency,
          })}
          required
        >
          <option value="" disabled>Select one</option>
          <option value="yen">YEN</option>
          <option value="usd">USD</option>
          <option value="rmb">RMB</option>
        </select>
      </FormControl>
      <FormControl
        label="Tax included in wage"
        htmlFor="taxincluded"
        className="items-center mb-6"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <div id="taxincluded" className="flex">
          <FormControl
            label="Yes"
            htmlFor="taxincluded-yes"
            className="items-center col-span-6"
            labelClassName="col-span-2 mr-2"
          >
            <input
              type="radio"
              id="taxincluded-yes"
              name="taxincluded"
              value="true"
              defaultChecked={thread ? thread.taxincluded : true}
              className="mx-4 col-span-2 w-4"
            />
          </FormControl>
          <FormControl
            label="No"
            htmlFor="taxincluded-no"
            className="items-center col-span-6"
            labelClassName="col-span-2 mr-2"
          >
            <input
              type="radio"
              id="taxincluded-no"
              name="taxincluded"
              value="false"
              defaultChecked={thread ? !thread.taxincluded : false}
              className="mx-4 col-span-2 w-4"
            />
          </FormControl>
        </div>
      </FormControl>
      <FormControl
        label="Tax rate (%)"
        htmlFor="taxrate"
        className="items-center mb-6"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <input
          type="number"
          id="taxrate"
          name="taxrate"
          step={0.1}
          min={0}
          max={100}
          defaultValue={thread?.taxrate ?? 0}
          className={clsx("col-span-12 border-1 p-2", {
            "border-slate-400": !state.errors?.taxrate,
            "border-red-500": state.errors?.taxrate,
          })}
        />
      </FormControl>
      <FormControl
        label="Work schedule"
        htmlFor="schedule"
        className="items-center mb-6"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <div id="schedule" className="col-span-12 flex flex-wrap gap-4">
          {WEEKDAYS.map((w) => (
            <label key={w.value} className="flex items-center">
              <input
                type="checkbox"
                name="schedule"
                value={w.value}
                defaultChecked={thread ? thread.schedule.includes(w.value as any) : w.value >= 1 && w.value <= 5}
                className="mr-1"
              />
              {w.label}
            </label>
          ))}
        </div>
      </FormControl>
      <div
        className="flex items-start py-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full bg-slate-600 hover:bg-slate-400 text-white p-2 rounded-lg"
        aria-disabled={isPending}
      >
        {isPending ? "Saving..." : thread ? "Save" : "Create thread"}
      </Button>
    </form>
  )
}
