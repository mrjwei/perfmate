"use client"

import React, { useActionState } from "react"
import { useTranslations } from "next-intl"
import { resetPassword } from "@/app/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FormControl from "@/app/ui/form/form-control"
import { TActionState } from "@/app/lib/types"

export default function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("Auth.resetPassword")
  const action = resetPassword.bind(null, token)
  const initialState: TActionState = { message: "", errors: {} }
  const [state, formAction, isPending] = useActionState(action, initialState)
  const errors = state?.errors ?? {}

  return (
    <form action={formAction}>
      <div className="rounded-lg bg-card shadow-sm">
        <div className="px-12 pb-4 pt-8">
          <h1 className="text-center text-2xl text-muted-foreground font-bold mb-12">
            {t("title")}
          </h1>
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
            {errors.password && (
              <p className="col-span-12 text-sm text-destructive mt-1">{errors.password}</p>
            )}
          </FormControl>
          <Button
            type="submit"
            className="w-full"
            aria-disabled={isPending}
          >
            {isPending ? t("saving") : t("submit")}
          </Button>
          <div
            className="flex items-start py-4"
            aria-live="polite"
            aria-atomic="true"
          >
            {state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
