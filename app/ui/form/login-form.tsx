"use client"

import React, { useActionState } from "react"
import { useTranslations } from "next-intl"
import { authenticate } from "@/app/lib/actions"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FormControl from "@/app/ui/form/form-control"
import LinkItem from "@/app/ui/link-item/link-item"

export default function LoginForm() {
  const t = useTranslations("Auth.login")
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  )

  return (
    <form action={formAction}>
      <div className="rounded-lg bg-card shadow-sm">
        <div className="px-12 pb-4 pt-8">
          <h1 className="text-center text-2xl text-muted-foreground font-bold mb-12">
            {t("title")}
          </h1>
          <FormControl
            label={t("emailLabel")}
            htmlFor="email"
            className="items-center mb-6"
            labelClassName="col-span-12 font-bold mb-2"
          >
            <Input
              className="col-span-12"
              type="email"
              id="email"
              name="email"
              placeholder={t("emailPlaceholder")}
              required
            />
          </FormControl>
          <FormControl
            label={t("passwordLabel")}
            htmlFor="password"
            className="items-center mb-6"
            labelClassName="col-span-12 font-bold mb-2"
          >
            <Input
              className="col-span-12"
              type="password"
              id="password"
              name="password"
              placeholder={t("passwordPlaceholder")}
              required
            />
          </FormControl>
          <div className="flex justify-end mb-6">
            <LinkItem href="/forgot-password" className="text-sm text-primary hover:opacity-80">
              {t("forgotPassword")}
            </LinkItem>
          </div>
          <Button
            type="submit"
            className="w-full"
            aria-disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="relative flex justify-center items-center h-6 w-6 mr-2">
                  <div className="absolute rounded-full h-6 w-6 border-4 border-white opacity-50"></div>
                  <div className="absolute animate-spin rounded-full h-6 w-6 border-4 border-t-white border-transparent"></div>
                </div>
                <span>{t("processing")}</span>
              </div>
            ) : (
              t("submit")
            )}
          </Button>
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center bg-muted px-12 py-4 rounded-b-lg">
          <span className="whitespace-nowrap mr-4">{t("newToPerfmate")}</span>
          <LinkItem
            href="/signup/step-1"
            className="text-primary hover:opacity-80"
          >
            <span className="whitespace-nowrap mr-2">{t("signUp")}</span>
            <ArrowRightIcon className="w-5" />
          </LinkItem>
        </div>
      </div>
    </form>
  )
}
