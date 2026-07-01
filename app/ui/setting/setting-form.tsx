"use client"

import React, { useActionState } from "react"
import { User } from "next-auth"
import FormControl from "@/app/ui/Form/form-control"
import Button from "@/app/ui/Button/Button"
import {updateUserInfo} from '@/app/lib/actions'
import { TActionState } from "@/app/lib/types"
import clsx from "clsx"

export default function SettingForm({ user }: { user: User }) {
  const initialState: TActionState = {
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
          {state.errors?.name && (
            <p className="mt-2 text-sm text-red-500">
              {state.errors.name}
            </p>
          )}
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
      <div className="flex items-center">
        <Button type="submit" className="bg-neutral-800 text-white mr-4">
          Save
        </Button>
      </div>
    </form>
  )
}
