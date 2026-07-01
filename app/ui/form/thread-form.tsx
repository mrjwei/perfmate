"use client"

import React, { useActionState, useState } from "react"
import clsx from "clsx"
import FormControl from "@/app/ui/form/form-control"
import Button from "@/app/ui/button/button"
import { createThreadForm, updateThreadForm } from "@/app/lib/actions"
import { IThread, TActionState } from "@/app/lib/types"
import { calculateWage, mapCurrencyToMark } from "@/app/lib/helpers"

const TIMEZONES: string[] = (() => {
  try {
    return Intl.supportedValuesOf("timeZone")
  } catch {
    return ["Asia/Tokyo", "America/New_York", "America/Los_Angeles", "Europe/London", "UTC"]
  }
})()

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
  const errors = state?.errors ?? {}
  const message = state?.message

  const [currency, setCurrency] = useState(thread?.currency ?? "yen")
  const [hourlywage, setHourlywage] = useState(thread?.hourlywage ?? 0)
  const [taxincluded, setTaxincluded] = useState(thread ? thread.taxincluded : true)
  const [taxrate, setTaxrate] = useState(thread?.taxrate ?? 0)
  const breakdown = calculateWage(60, { hourlywage, taxincluded, taxrate })
  const mark = mapCurrencyToMark(currency)

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
            "border-slate-400": !errors.name,
            "border-red-500": errors.name,
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
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className={clsx("col-span-12 border-1 p-2", {
            "border-slate-400": !errors.currency,
            "border-red-500": errors.currency,
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
        label="Timezone"
        htmlFor="timezone"
        className="items-center mb-6"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <select
          name="timezone"
          id="timezone"
          defaultValue={thread?.timezone ?? "Asia/Tokyo"}
          className={clsx("col-span-12 border-1 p-2", {
            "border-slate-400": !errors.timezone,
            "border-red-500": errors.timezone,
          })}
          required
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
        <p className="col-span-12 text-xs text-slate-400 mt-1">
          This thread's business timezone — used to decide what "today" is and to record accurate start/end times, independent of your own device's timezone.
        </p>
      </FormControl>
      <FormControl
        label="Hourly wage"
        htmlFor="hourlywage"
        className="items-center mb-2"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <input
          type="number"
          id="hourlywage"
          name="hourlywage"
          step={10}
          value={hourlywage}
          onChange={(e) => setHourlywage(Number(e.target.value))}
          className={clsx("col-span-12 border-1 p-2", {
            "border-slate-400": !errors.hourlywage,
            "border-red-500": errors.hourlywage,
          })}
          required
        />
      </FormControl>
      <p className="text-sm text-slate-400 mb-6">
        Enter your rate exactly as agreed with the client, then say below whether it already includes tax.
      </p>
      <FormControl
        label="Tax included in the rate above"
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
              checked={taxincluded}
              onChange={() => setTaxincluded(true)}
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
              checked={!taxincluded}
              onChange={() => setTaxincluded(false)}
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
          value={taxrate}
          onChange={(e) => setTaxrate(Number(e.target.value))}
          className={clsx("col-span-12 border-1 p-2", {
            "border-slate-400": !errors.taxrate,
            "border-red-500": errors.taxrate,
          })}
        />
      </FormControl>
      <div className="col-span-12 rounded-lg bg-slate-50 border border-slate-200 p-4 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Rate breakdown (per hour)</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500">Excl. tax</span>
          <span>{mark} {breakdown.exclTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold">Incl. tax</span>
          <strong>{mark} {breakdown.inclTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          The tax-included figure is what's used everywhere else in the app (records, totals).
        </p>
      </div>
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
        {message && (
          <p className="text-sm text-red-500">{message}</p>
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
