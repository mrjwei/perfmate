"use client"

import React, { useActionState } from "react"
import { signup } from "@/app/lib/actions"
import {
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import Button from "@/app/ui/button/button"
import FormControl from "@/app/ui/form/form-control"

export default function SignupStepOneForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    signup,
    undefined
  )

  return (
    <form action={formAction}>
      <div className="rounded-lg bg-white shadow">
        <div className="px-12 pb-4 pt-8">
          <h1 className="text-center text-2xl text-slate-400 font-bold mb-12">
            Step 1: Create user
          </h1>
          <FormControl
            label="Name (Required)"
            htmlFor="name"
            className="items-center mb-6"
            labelClassName="col-span-12 font-bold mb-2"
          >
            <input
              className="col-span-12 border-1 p-2"
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              required
            />
          </FormControl>
          <FormControl
            label="Email (Required)"
            htmlFor="email"
            className="items-center mb-6"
            labelClassName="col-span-12 font-bold mb-2"
          >
            <input
              className="col-span-12 border-1 p-2"
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              required
            />
          </FormControl>
          <FormControl
            label="Password (Required)"
            htmlFor="password"
            className="items-center mb-6"
            labelClassName="col-span-12 font-bold mb-2"
          >
            <input
              className="col-span-12 border-1 p-2"
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
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
                <span className="whitespace-nowrap mr-2">Save & Next</span>
                <ArrowRightIcon className="w-5" />
              </div>
            )}
          </Button>
          <div
            className="flex items-start py-4"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-500">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
