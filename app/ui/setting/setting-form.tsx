"use client"

import React, { useActionState } from "react"
import { User } from "next-auth"
import FormControl from "@/app/ui/form/form-control"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
        <Input
          type="text"
          id="username"
          name="username"
          defaultValue={user.name!}
          className={clsx(
            "col-span-8 mx-4 mb-2",
            { "border-destructive": state.errors?.name }
          )}
          aria-describedby="username-error"
        />
        <div id="username-error" className="col-span-12" aria-live="polite" aria-atomic="true">
          {state.errors?.name && (
            <p className="mt-2 text-sm text-destructive">
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
        <Input
          type="email"
          id="email"
          name="email"
          value={user.email!}
          readOnly
          className="col-span-8 bg-muted mx-4 mb-2"
        />
      </FormControl>
      <div className="flex items-center">
        <Button type="submit" className="mr-4">
          Save
        </Button>
      </div>
    </form>
  )
}
