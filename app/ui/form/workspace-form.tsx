"use client"

import React, { useActionState, useState } from "react"
import clsx from "clsx"
import FormControl from "@/app/ui/form/form-control"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createWorkspaceForm, updateWorkspaceForm } from "@/app/lib/actions"
import { IWorkspace, TActionState, TWeekday } from "@/app/lib/types"
import { calculateWage, mapCurrencyToMark } from "@/app/lib/helpers"

const TIMEZONES: string[] = (() => {
  try {
    return Intl.supportedValuesOf("timeZone")
  } catch {
    return ["Asia/Tokyo", "America/New_York", "America/Los_Angeles", "Europe/London", "UTC"]
  }
})()

const WEEKDAYS: { value: TWeekday; label: string }[] = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
]

const selectClassName = "col-span-12 flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"

export default function WorkspaceForm({ workspace }: { workspace?: IWorkspace }) {
  const action = workspace ? updateWorkspaceForm.bind(null, workspace.id) : createWorkspaceForm
  const initialState: TActionState = { message: "", errors: {} }
  const [state, formAction, isPending] = useActionState(action, initialState)
  const errors = state?.errors ?? {}
  const message = state?.message

  const [currency, setCurrency] = useState(workspace?.currency ?? "yen")
  const [hourlywage, setHourlywage] = useState(workspace?.hourlywage ?? 0)
  const [taxincluded, setTaxincluded] = useState(workspace ? workspace.taxincluded : true)
  const [taxrate, setTaxrate] = useState(workspace?.taxrate ?? 0)
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
        <Input
          type="text"
          id="name"
          name="name"
          defaultValue={workspace?.name}
          placeholder="e.g. Acme Corp, Freelance Design"
          className={clsx("col-span-12", { "border-destructive": errors.name })}
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
          className={clsx(selectClassName, { "border-destructive": errors.currency })}
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
          defaultValue={workspace?.timezone ?? "Asia/Tokyo"}
          className={clsx(selectClassName, { "border-destructive": errors.timezone })}
          required
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
        <p className="col-span-12 text-xs text-muted-foreground mt-1">
          This workspace's business timezone — used to decide what "today" is and to record accurate start/end times, independent of your own device's timezone.
        </p>
      </FormControl>
      <FormControl
        label="Hourly wage"
        htmlFor="hourlywage"
        className="items-center mb-2"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <Input
          type="number"
          id="hourlywage"
          name="hourlywage"
          step={10}
          value={hourlywage}
          onChange={(e) => setHourlywage(Number(e.target.value))}
          className={clsx("col-span-12", { "border-destructive": errors.hourlywage })}
          required
        />
      </FormControl>
      <p className="text-sm text-muted-foreground mb-6">
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
              className="mx-4 col-span-2 w-4 h-4 accent-primary"
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
              className="mx-4 col-span-2 w-4 h-4 accent-primary"
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
        <Input
          type="number"
          id="taxrate"
          name="taxrate"
          step={0.1}
          min={0}
          max={100}
          value={taxrate}
          onChange={(e) => setTaxrate(Number(e.target.value))}
          className={clsx("col-span-12", { "border-destructive": errors.taxrate })}
        />
      </FormControl>
      <Card className="col-span-12 mb-6">
        <CardContent>
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Rate breakdown (per hour)</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Excl. tax</span>
            <span>{mark} {breakdown.exclTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold">Incl. tax</span>
            <strong>{mark} {breakdown.inclTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The tax-included figure is what's used everywhere else in the app (records, totals).
          </p>
        </CardContent>
      </Card>
      <FormControl
        label="Work schedule"
        htmlFor="schedule"
        className="items-center mb-6"
        labelClassName="col-span-12 font-bold mb-2"
      >
        <div id="schedule" className="col-span-12 flex flex-wrap gap-4">
          {WEEKDAYS.map((w) => (
            <label key={w.value} className="flex items-center text-sm">
              <input
                type="checkbox"
                name="schedule"
                value={w.value}
                defaultChecked={workspace ? workspace.schedule.includes(w.value) : w.value >= 1 && w.value <= 5}
                className="mr-1.5 w-4 h-4 accent-primary"
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
          <p className="text-sm text-destructive">{message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        aria-disabled={isPending}
      >
        {isPending ? "Saving..." : workspace ? "Save" : "Create workspace"}
      </Button>
    </form>
  )
}
