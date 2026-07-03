import React from "react"
import { getTranslations } from "next-intl/server"
import { verifyEmail } from "@/app/lib/actions"
import LinkItem from "@/app/ui/link-item/link-item"

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const { success } = await verifyEmail(token)
  const t = await getTranslations("Auth.verifyEmail")

  return (
    <div className="mx-auto py-24 max-w-lg">
      <div className="rounded-lg bg-card shadow-sm px-12 py-8 text-center">
        <h1 className="text-2xl text-muted-foreground font-bold mb-4">
          {success ? t("successTitle") : t("failureTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {success ? t("successBody") : t("failureBody")}
        </p>
        <LinkItem href="/app" className="justify-center text-primary hover:opacity-80">
          {t("continue")}
        </LinkItem>
      </div>
    </div>
  )
}
