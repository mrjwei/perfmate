"use client"

import React, { useActionState } from "react"
import { setUserInfo } from "@/app/lib/actions"
import {
  AtSymbolIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import Button from "@/app/ui/button/button"
import FormControl from "@/app/ui/form/form-control"

export default function SignupStepTwoForm({ email }: { email: string }) {
  const [errorMessage, formAction, isPending] = useActionState(
    setUserInfo,
    undefined
  )

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`mb-3 text-2xl`}>Step 2: User Settings</h1>
        <div className="w-full">
          <div>
            <label className="hidden" htmlFor="email" aria-hidden>
              User Id
            </label>
            <div>
              <input
                className="hidden"
                id="email"
                type="email"
                name="email"
                value={email}
                aria-hidden
                readOnly
              />
            </div>
          </div>
          <FormControl
            label="Hourly wages"
            htmlFor="hourlywages"
            className="items-center mb-8"
            labelClassName="col-span-12 font-bold mb-2"
          >
            <input
              type="number"
              id="hourlywages"
              name="hourlywages"
              step={10}
              className="col-span-12 border-1 border-slate-400 bg-slate-100 p-2"
            />
          </FormControl>
          <FormControl
            label="Currency"
            htmlFor="currency"
            className="items-center mb-8"
            labelClassName="col-span-12 font-bold mb-2"
          >
            <select
              name="currency"
              id="currency"
              className="col-span-12 border-1 border-slate-400 bg-slate-100 p-2"
            >
              <option value="">Select one</option>
              <option value="yen">YEN</option>
              <option value="usd">USD</option>
              <option value="rmb">RMB</option>
            </select>
          </FormControl>
          <FormControl
            label="Tax included"
            htmlFor="taxincluded"
            className="items-center mb-8"
            labelClassName="col-span-12 font-bold mb-2"
          >
            <div id="taxincluded" className="flex">
              <FormControl
                label="Yes"
                htmlFor="yes"
                className="items-center col-span-6"
                labelClassName="col-span-2"
              >
                <input
                  type="radio"
                  id="yes"
                  name="taxincluded"
                  value="true"
                  defaultChecked
                  className="mx-4 col-span-2 w-4"
                />
              </FormControl>
              <FormControl
                label="No"
                htmlFor="no"
                className="items-center col-span-6"
                labelClassName="col-span-2"
              >
                <input
                  type="radio"
                  id="no"
                  name="taxincluded"
                  value="false"
                  className="mx-4 col-span-2 w-4"
                />
              </FormControl>
            </div>
          </FormControl>
        </div>
        <Button type="submit" className="mt-4 w-full" aria-disabled={isPending}>
          Sign Up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  )
}
