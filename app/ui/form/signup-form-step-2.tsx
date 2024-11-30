"use client"

import React, { useActionState } from "react"
import { setUserInfo } from "@/app/lib/actions"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import Button from "@/app/ui/common/button/button"
import FormControl from "@/app/ui/form/form-control"

export default function SignupStepTwoForm({ email }: { email: string }) {
  const [errorMessage, formAction, isPending] = useActionState(
    setUserInfo,
    undefined
  )

  return (
    <form action={formAction}>
      <div className="rounded-lg bg-white shadow">
        <div className="px-12 pb-4 pt-8">
          <h1 className="text-center text-2xl text-slate-400 font-bold mb-12">
            Step 2: Configure user
          </h1>
          <FormControl
            label="Email"
            htmlFor="email"
            aria-hidden
            className="hidden"
          >
            <input
              className="hidden"
              id="email"
              type="email"
              name="email"
              value={email}
              aria-hidden
              readOnly
            />
          </FormControl>
          <FormControl
              label="Hourly wages (Optional)"
              htmlFor="hourlywages"
              className="items-center mb-6"
              labelClassName="col-span-12 font-bold mb-2"
            >
              <input
                type="number"
                id="hourlywages"
                name="hourlywages"
                step={10}
                className="col-span-12 border-1 p-2"
              />
            </FormControl>
            <FormControl
              label="Currency (Optional)"
              htmlFor="currency"
              className="items-center mb-6"
              labelClassName="col-span-12 font-bold mb-2"
            >
              <select
                name="currency"
                id="currency"
                className="col-span-12 border-1 p-2"
              >
                <option value="">Select one</option>
                <option value="yen">YEN</option>
                <option value="usd">USD</option>
                <option value="rmb">RMB</option>
              </select>
            </FormControl>
            <FormControl
              label="Tax included (Optional)"
              htmlFor="taxincluded"
              className="items-center mb-6"
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
            <Button
            type="submit"
            className="w-full bg-slate-600 hover:bg-slate-400 text-white p-2 rounded-lg"
            aria-disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="relative flex justify-center items-center h-6 w-6 mr-2">
                  <div className="absolute rounded-full h-6 w-6 border-4 border-white opacity-50"></div>
                  <div className="absolute animate-spin rounded-full h-6 w-6 border-4 border-t-white border-transparent"></div>
                </div>
                <span>Processing</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="whitespace-nowrap mr-2">Save & Sign Up</span>
                <ArrowRightIcon className="w-5" />
              </div>
            )}
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
      </div>
    </form>
  )
}
