"use client"

import React, { useActionState } from "react"
import { User } from "next-auth"
import FormControl from "@/app/ui/form/form-control"
import Button from "@/app/ui/button/button"
import {updateUserInfo} from '@/app/lib/actions'
import clsx from "clsx"

export default function SettingForm({ user }: { user: User }) {
  const initialState: any = {
    message: '',
    errors: {}
  }
  const [state, formAction] = useActionState(
    updateUserInfo,
    initialState
  )

  return (
    <form action={formAction}>
      <FormControl
        label="User Id"
        htmlFor="userid"
        className="hidden"
        labelClassName="hidden"
      >
        <input
          type="text"
          id="userid"
          name="userid"
          value={user.id}
          readOnly
          aria-hidden
        />
      </FormControl>
      <FormControl
        label="Username"
        htmlFor="username"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <input
          type="text"
          id="username"
          name="username"
          defaultValue={user.name!}
          className={clsx(
            "col-span-8 border-1 p-2 mx-4 mb-2",
            {
              'border-slate-400': !state.errors?.name,
              'border-red-500': state.errors?.name,
            }
          )}
          aria-describedby="username-error"
        />
        <div id="username-error" className="col-span-12" aria-live="polite" aria-atomic="true">
          {state.errors?.name && state.errors.name.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
        </div>
      </FormControl>
      <FormControl
        label="Email"
        htmlFor="email"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <input
          type="email"
          id="email"
          name="email"
          value={user.email!}
          readOnly
          className="col-span-8 border-1 border-slate-400 bg-slate-100 p-2 mx-4 mb-2"
        />
      </FormControl>
      <FormControl
        label="Hourly wages"
        htmlFor="hourlywages"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <input
          type="number"
          id="hourlywages"
          name="hourlywages"
          defaultValue={user.hourlywages}
          className={clsx(
            "col-span-8 border-1 p-2 mx-4 mb-2",
            {
              'border-slate-400': !state.errors?.hourlywages,
              'border-red-500': state.errors?.hourlywages,
            }
          )}
          aria-describedby="hourlywages-error"
        />
        <div id="hourlywages-error" className="col-span-12" aria-live="polite" aria-atomic="true">
          {state.errors?.hourlywages && state.errors.hourlywages.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
        </div>
      </FormControl>
      <FormControl
        label="Currency"
        htmlFor="currency"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <select
          name="currency"
          id="currency"
          defaultValue={user.currency}
          className={clsx(
            "col-span-8 border-1 p-2 mx-4 mb-2",
            {
              'border-slate-400': !state.errors?.currency,
              'border-red-500': state.errors?.currency,
            }
          )}
          aria-describedby="currency-error"
        >
          <option value="">Select one</option>
          <option value="yen">YEN</option>
          <option value="usd">USD</option>
          <option value="rmb">RMB</option>
        </select>
        <div id="currency-error" className="col-span-12" aria-live="polite" aria-atomic="true">
          {state.errors?.currency && state.errors.currency.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
        </div>
      </FormControl>
      <FormControl
        label="Tax included"
        htmlFor="taxincluded"
        className="items-center mb-8"
        labelClassName="col-span-4 font-bold"
      >
        <div id="taxincluded" className="flex">
          <FormControl
            label="Yes"
            htmlFor="yes"
            className="items-center col-span-2 mx-4"
            labelClassName="font-bold col-span-2"
          >
            <input
              type="radio"
              id="yes"
              name="taxincluded"
              value='true'
              defaultChecked={user.taxincluded}
              className="mx-4 col-span-2 w-4"
            />
          </FormControl>
          <FormControl
            label="No"
            htmlFor="no"
            className="items-center col-span-2 mx-4"
            labelClassName="font-bold col-span-2"
          >
            <input
              type="radio"
              id="no"
              name="taxincluded"
              value='false'
              defaultChecked={!user.taxincluded}
              className="mx-4 col-span-2 w-4"
            />
          </FormControl>
        </div>
      </FormControl>
      <div className="flex items-center">
        <Button type="submit" className="bg-lime-600 text-white mr-4">
          Save
        </Button>
      </div>
    </form>
  )
}
