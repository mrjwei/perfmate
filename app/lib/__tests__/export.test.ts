import { describe, it, expect } from "vitest"
import { buildExportCsv } from "@/app/lib/export"
import { TAnnualSummary } from "@/app/lib/tax"

const summary: TAnnualSummary = {
  workspace: { id: "ws-1", name: "Acme Corp", currency: "yen", taxcountry: "JP" },
  year: "2026",
  totalWorkMins: 12000,
  grossIncomeExclTax: 500000,
  grossIncomeInclTax: 550000,
  monthly: [
    { month: "2026-01", totalWorkMins: 6000, grossIncomeExclTax: 250000, grossIncomeInclTax: 275000 },
    { month: "2026-02", totalWorkMins: 6000, grossIncomeExclTax: 250000, grossIncomeInclTax: 275000 },
    ...Array.from({ length: 10 }, (_, i) => ({
      month: `2026-${String(i + 3).padStart(2, "0")}`,
      totalWorkMins: 0,
      grossIncomeExclTax: 0,
      grossIncomeInclTax: 0,
    })),
  ],
}

describe("buildExportCsv", () => {
  it("starts with a UTF-8 BOM", () => {
    const csv = buildExportCsv(summary, "accountant")
    expect(csv.charCodeAt(0)).toBe(0xfeff)
  })

  it("accountant format includes a header row and monthly totals", () => {
    const csv = buildExportCsv(summary, "accountant")
    expect(csv).toContain("Month,Total Work Hours,Gross Income (Excl. Tax),Gross Income (Incl. Tax)")
    expect(csv).toContain("2026-01,100.00,250000,275000")
    expect(csv).toContain("Total,200.00,500000,550000")
  })

  it("freee format uses freee's documented columns and skips zero-income months", () => {
    const csv = buildExportCsv(summary, "freee")
    expect(csv).toContain("発生日,勘定科目,取引先,金額,摘要")
    expect(csv).toContain("2026-01-31,売上高,Acme Corp,275000")
    // Only Jan/Feb have income; the other 10 zero-income months are omitted.
    expect(csv.split("\r\n").length).toBe(3)
  })

  it("mfcloud format uses MoneyForward's documented columns with sequential transaction numbers", () => {
    const csv = buildExportCsv(summary, "mfcloud")
    expect(csv).toContain("取引No,取引日,勘定科目,補助科目,部門,取引先,税区分,インボイス,金額(円),摘要,タグ,メモ")
    expect(csv).toContain("1,2026-01-31,売上高,,,Acme Corp,,,275000")
    expect(csv).toContain("2,2026-02-28,売上高,,,Acme Corp,,,275000")
  })

  it("escapes fields containing commas", () => {
    const withComma: TAnnualSummary = {
      ...summary,
      workspace: { ...summary.workspace, name: "Acme, Inc." },
    }
    const csv = buildExportCsv(withComma, "freee")
    expect(csv).toContain('"Acme, Inc."')
  })
})
