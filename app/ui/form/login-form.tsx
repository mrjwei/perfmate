"use client"

import React, { useActionState } from "react"
import { authenticate } from "@/app/lib/actions"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import Button from "@/app/ui/button/button"
import FormControl from "@/app/ui/form/form-control"
import LinkItem from "@/app/ui/link-item/link-item"

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  )

  return (
    <form action={formAction}>
      <div className="rounded-lg bg-white shadow">
        <div className="px-12 pb-4 pt-8">
          <h1 className="text-center text-2xl text-slate-400 font-bold mb-12">
            Log in to your account
          </h1>
          <FormControl
            label="Email"
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
            label="Password"
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
              "Log In"
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
        <div className="flex items-center justify-center bg-slate-200 px-12 py-4 rounded-b-lg">
          <span className="whitespace-nowrap mr-4">New to Perfmate?</span>
          <LinkItem
            href="/signup/step-1"
            className="text-blue-600 hover:text-blue-400"
          >
            <span className="whitespace-nowrap mr-2">Sign Up</span>
            <ArrowRightIcon className="w-5" />
          </LinkItem>
        </div>
      </div>
    </form>
  )
}
