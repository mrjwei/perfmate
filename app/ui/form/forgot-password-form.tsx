"use client"

import React, { useActionState } from "react"
import { useTranslations } from "next-intl"
import { requestPasswordReset } from "@/app/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FormControl from "@/app/ui/form/form-control"
import { TActionState } from "@/app/lib/types"

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth.forgotPassword")
  const initialState: TActionState = { message: "", errors: {} }
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

  return (
    <form action={formAction}>
      <div className="rounded-lg bg-card shadow-sm">
        <div className="px-12 pb-4 pt-8">
          <h1 className="text-center text-2xl text-muted-foreground font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {t("instructions")}
          </p>
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
          <Button
            type="submit"
            className="w-full"
            aria-disabled={isPending}
          >
            {isPending ? t("sending") : t("submit")}
          </Button>
          <div
            className="flex items-start py-4"
            aria-live="polite"
            aria-atomic="true"
          >
            {state?.message && (
              <p className="text-sm text-muted-foreground">{state.message}</p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
