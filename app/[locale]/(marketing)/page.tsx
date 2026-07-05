import { getTranslations, getLocale } from "next-intl/server"
import { redirect } from "@/i18n/navigation"
import { auth } from "@/auth"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline"

export default async function LandingPage() {
  const session = await auth()
  const locale = await getLocale()
  if (session) {
    redirect({ href: "/app", locale })
  }

  const t = await getTranslations("Marketing")

  const features = [
    { icon: ClockIcon, titleKey: "features.tracking.title", bodyKey: "features.tracking.body" },
    { icon: CalculatorIcon, titleKey: "features.wages.title", bodyKey: "features.wages.body" },
    { icon: DocumentArrowDownIcon, titleKey: "features.export.title", bodyKey: "features.export.body" },
  ]

  return (
    <div>
      <section className="max-w-3xl mx-auto text-center px-8 py-24">
        <h2 className="text-4xl font-bold mb-6">{t("hero.title")}</h2>
        <p className="text-lg text-muted-foreground mb-10">{t("hero.subtitle")}</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup/step-1">
            <Button type="button" className="px-8 py-3 text-base">{t("hero.cta")}</Button>
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:opacity-80">
            {t("hero.secondaryCta")}
          </Link>
        </div>
      </section>

      <section className="bg-card py-20 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">{t("problem.title")}</h3>
          <p className="text-muted-foreground">{t("problem.body")}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map(({ icon: Icon, titleKey, bodyKey }) => (
            <div key={titleKey} className="text-center">
              <Icon className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h4 className="font-bold mb-2">{t(titleKey)}</h4>
              <p className="text-sm text-muted-foreground">{t(bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-20 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">{t("pricingTeaser.title")}</h3>
          <p className="text-muted-foreground mb-8">{t("pricingTeaser.body")}</p>
          <ul className="text-left inline-block mb-8">
            <li className="flex items-center mb-2">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-primary" />
              {t("pricingTeaser.point1")}
            </li>
            <li className="flex items-center mb-2">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-primary" />
              {t("pricingTeaser.point2")}
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-primary" />
              {t("pricingTeaser.point3")}
            </li>
          </ul>
          <div>
            <Link href="/pricing">
              <Button type="button" variant="ghost">{t("pricingTeaser.cta")}</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
