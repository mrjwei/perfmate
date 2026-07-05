import React from "react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { League_Spartan } from "next/font/google"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

const spartan = League_Spartan({ subsets: ["latin"] })

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Marketing")

  return (
    <div className="min-h-full flex flex-col">
      <header className="flex items-center justify-between py-4 px-8 shadow-sm bg-card">
        <h1 className={`${spartan.className} text-foreground text-2xl font-bold`}>
          <Link href="/">PERFMATE</Link>
        </h1>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-sm font-medium hover:opacity-80">
            {t("nav.pricing")}
          </Link>
          <Link href="/login" className="text-sm font-medium hover:opacity-80">
            {t("nav.login")}
          </Link>
          <Link href="/signup/step-1">
            <Button type="button">{t("nav.signUp")}</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="py-8 px-8 text-center text-sm text-muted-foreground border-t border-border">
        {t("footer", { year: new Date().getFullYear() })}
      </footer>
    </div>
  )
}
