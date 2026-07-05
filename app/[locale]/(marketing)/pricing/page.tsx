import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"

export default async function PricingPage() {
  const t = await getTranslations("Pricing")

  const freeFeatures = [t("free.feature1"), t("free.feature2")]
  const freeExcluded = [t("free.excluded1")]
  const proFeatures = [t("pro.feature1"), t("pro.feature2"), t("pro.feature3")]

  return (
    <div className="max-w-4xl mx-auto px-8 py-24">
      <h2 className="text-4xl font-bold text-center mb-4">{t("title")}</h2>
      <p className="text-lg text-muted-foreground text-center mb-16">{t("subtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-lg bg-card shadow-sm p-8">
          <h3 className="text-xl font-bold mb-2">{t("free.title")}</h3>
          <p className="text-3xl font-bold mb-6">{t("free.price")}</p>
          <ul className="mb-8">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-center mb-3">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-primary shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
            {freeExcluded.map((feature) => (
              <li key={feature} className="flex items-center mb-3 text-muted-foreground">
                <XCircleIcon className="w-5 h-5 mr-2 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link href="/signup/step-1">
            <Button type="button" variant="ghost" className="w-full">{t("free.cta")}</Button>
          </Link>
        </div>

        <div className="rounded-lg bg-card shadow-sm p-8 border-2 border-primary">
          <h3 className="text-xl font-bold mb-2">{t("pro.title")}</h3>
          <p className="text-3xl font-bold mb-6">{t("pro.price")}</p>
          <ul className="mb-8">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center mb-3">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-primary shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link href="/signup/step-1">
            <Button type="button" className="w-full">{t("pro.cta")}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
