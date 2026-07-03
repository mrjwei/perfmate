"use client"

import React, { useActionState } from "react"
import { useTranslations } from "next-intl"
import { createCheckoutSession, createPortalSession } from "@/app/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { IUserPlan } from "@/app/lib/types"

export default function BillingSection({ planInfo }: { planInfo: IUserPlan }) {
  const t = useTranslations("Billing")
  const isPro = planInfo.plan === "pro"
  const [checkoutState, checkoutAction, isCheckoutPending] = useActionState(createCheckoutSession, undefined)
  const [portalState, portalAction, isPortalPending] = useActionState(createPortalSession, undefined)

  return (
    <Card className="mt-8">
      <CardContent>
        <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{t("title")}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold">{isPro ? t("proPlan") : t("freePlan")}</p>
            {isPro && planInfo.planStatus && planInfo.planStatus !== "active" && (
              <p className="text-sm text-destructive">{t("statusWarning", { status: planInfo.planStatus })}</p>
            )}
          </div>
          {isPro ? (
            <form action={portalAction}>
              <Button type="submit" variant="ghost" aria-disabled={isPortalPending}>{t("manageSubscription")}</Button>
            </form>
          ) : (
            <form action={checkoutAction}>
              <Button type="submit" aria-disabled={isCheckoutPending}>{t("upgrade")}</Button>
            </form>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{isPro ? t("proDescription") : t("freeDescription")}</p>
        {(checkoutState?.message || portalState?.message) && (
          <p className="text-sm text-destructive mt-2">{checkoutState?.message ?? portalState?.message}</p>
        )}
      </CardContent>
    </Card>
  )
}
