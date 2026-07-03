import { getTranslations, getLocale } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/card"
import { getPathname } from "@/i18n/navigation"
import { TPlan } from "@/app/lib/types"

const EXPORT_FORMATS = [
  { format: "accountant", labelKey: "accountantCsv" },
  { format: "freee", labelKey: "freeeCsv" },
  { format: "mfcloud", labelKey: "mfCloudCsv" },
  { format: "pdf", labelKey: "pdfSummary" },
] as const

export default async function TaxExportSection({
  workspaceId,
  plan,
}: {
  workspaceId: string
  plan: TPlan
}) {
  const t = await getTranslations("TaxExport")
  const locale = await getLocale()
  const currentYear = new Date().getUTCFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]
  const exportPath = getPathname({ href: `/app/${workspaceId}/export`, locale })

  if (plan !== "pro") {
    return (
      <Card className="mt-8">
        <CardContent>
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{t("title")}</p>
          <p className="text-sm text-muted-foreground">{t("upsell")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <CardContent>
        <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{t("title")}</p>
        <p className="text-sm text-muted-foreground mb-4">{t("description")}</p>
        {years.map((year) => (
          <div key={year} className="flex items-center justify-between mb-2">
            <span className="font-medium">{year}</span>
            <div className="flex gap-4">
              {EXPORT_FORMATS.map(({ format, labelKey }) => (
                <a
                  key={format}
                  href={`${exportPath}?year=${year}&format=${format}`}
                  className="text-sm text-primary hover:opacity-80"
                >
                  {t(labelKey)}
                </a>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
