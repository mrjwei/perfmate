import path from "path"
import { Document, Page, Text, View, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer"
import { TAnnualSummary } from "@/app/lib/tax"
import { mapCurrencyToMark } from "@/app/lib/helpers"

// Helvetica (react-pdf's default) has no CJK glyphs — Japanese text
// rendered as mojibake without this. Registered once at module load;
// vendored locally (not fetched from Google Fonts at render time) so PDF
// generation doesn't depend on an external network call succeeding.
Font.register({
  family: "Noto Sans JP",
  src: path.join(process.cwd(), "assets/fonts/NotoSansJP-Variable.ttf"),
})

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#666", marginBottom: 20 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingVertical: 6 },
  headerRow: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#111", paddingVertical: 6, fontWeight: 700 },
  totalRow: { flexDirection: "row", borderTopWidth: 2, borderTopColor: "#111", paddingVertical: 6, fontWeight: 700 },
  cellMonth: { width: "25%" },
  cellHours: { width: "25%", textAlign: "right" },
  cellExcl: { width: "25%", textAlign: "right" },
  cellIncl: { width: "25%", textAlign: "right" },
})

const COPY = {
  en: {
    title: (name: string) => `Annual Summary — ${name}`,
    subtitle: (year: string) => `Tax year ${year}`,
    month: "Month",
    hours: "Hours",
    exclTax: "Excl. Tax",
    inclTax: "Incl. Tax",
    total: "Total",
  },
  ja: {
    title: (name: string) => `年間サマリー — ${name}`,
    subtitle: (year: string) => `${year}年分`,
    month: "月",
    hours: "時間",
    exclTax: "税抜",
    inclTax: "税込",
    total: "合計",
  },
}

const formatAmount = (mark: string, amount: number) => `${mark}${Math.round(amount).toLocaleString()}`

const AnnualSummaryDocument = ({ summary, locale }: { summary: TAnnualSummary; locale: "en" | "ja" }) => {
  const t = COPY[locale] ?? COPY.en
  const mark = mapCurrencyToMark(summary.workspace.currency)

  return (
    <Document>
      <Page size="A4" style={[styles.page, locale === "ja" ? { fontFamily: "Noto Sans JP" } : {}]}>
        <Text style={styles.title}>{t.title(summary.workspace.name)}</Text>
        <Text style={styles.subtitle}>{t.subtitle(summary.year)}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.cellMonth}>{t.month}</Text>
          <Text style={styles.cellHours}>{t.hours}</Text>
          <Text style={styles.cellExcl}>{t.exclTax}</Text>
          <Text style={styles.cellIncl}>{t.inclTax}</Text>
        </View>
        {summary.monthly.map((m) => (
          <View style={styles.row} key={m.month}>
            <Text style={styles.cellMonth}>{m.month}</Text>
            <Text style={styles.cellHours}>{(m.totalWorkMins / 60).toFixed(2)}</Text>
            <Text style={styles.cellExcl}>{formatAmount(mark, m.grossIncomeExclTax)}</Text>
            <Text style={styles.cellIncl}>{formatAmount(mark, m.grossIncomeInclTax)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.cellMonth}>{t.total}</Text>
          <Text style={styles.cellHours}>{(summary.totalWorkMins / 60).toFixed(2)}</Text>
          <Text style={styles.cellExcl}>{formatAmount(mark, summary.grossIncomeExclTax)}</Text>
          <Text style={styles.cellIncl}>{formatAmount(mark, summary.grossIncomeInclTax)}</Text>
        </View>
      </Page>
    </Document>
  )
}

export const buildAnnualSummaryPdf = async (summary: TAnnualSummary, locale: string): Promise<Buffer> => {
  const resolvedLocale = locale === "ja" ? "ja" : "en"
  return renderToBuffer(<AnnualSummaryDocument summary={summary} locale={resolvedLocale} />)
}
