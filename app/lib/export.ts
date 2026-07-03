import { TAnnualSummary, TExportFormat } from "@/app/lib/tax"

// UTF-8 BOM: freee's own sample transaction-import template ships BOM'd
// UTF-8 ("【サンプル】取引インポート（UTF-8 BOM付き）.csv"), and it's also what
// makes Excel on Windows open a UTF-8 CSV without mangling non-ASCII text —
// applied to all three variants for consistency.
const BOM = "﻿"

const escapeCsvField = (value: string | number) => {
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const toCsv = (rows: (string | number)[][]) =>
  BOM + rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n")

const lastDayOfMonth = (month: string) => {
  const [year, monthNum] = month.split("-").map(Number)
  const day = new Date(Date.UTC(year, monthNum, 0)).getUTCDate()
  return `${month}-${String(day).padStart(2, "0")}`
}

const round = (n: number) => Math.round(n)

// Plain, human-readable CSV for handing straight to an accountant/bookkeeper
// — no assumptions about their software's own import format.
const buildAccountantCsv = (summary: TAnnualSummary) => {
  const rows: (string | number)[][] = [
    ["Workspace", summary.workspace.name],
    ["Year", summary.year],
    ["Currency", summary.workspace.currency],
    [],
    ["Month", "Total Work Hours", "Gross Income (Excl. Tax)", "Gross Income (Incl. Tax)"],
  ]
  for (const m of summary.monthly) {
    rows.push([m.month, (m.totalWorkMins / 60).toFixed(2), round(m.grossIncomeExclTax), round(m.grossIncomeInclTax)])
  }
  rows.push([
    "Total",
    (summary.totalWorkMins / 60).toFixed(2),
    round(summary.grossIncomeExclTax),
    round(summary.grossIncomeInclTax),
  ])
  return toCsv(rows)
}

// freee会計 transaction-import columns, per freee's own support docs:
// 発生日,勘定科目,取引先,金額,摘要 — one row per month with income, using the
// tax-included total (what freee, like this app, treats as the actual cash
// amount). 勘定科目 defaults to 売上高 (sales revenue), the standard category
// for freelance service income — adjust in freee if your chart of accounts
// differs.
const buildFreeeCsv = (summary: TAnnualSummary) => {
  const rows: (string | number)[][] = [["発生日", "勘定科目", "取引先", "金額", "摘要"]]
  for (const m of summary.monthly) {
    if (m.grossIncomeInclTax === 0) {
      continue
    }
    rows.push([
      lastDayOfMonth(m.month),
      "売上高",
      summary.workspace.name,
      round(m.grossIncomeInclTax),
      `${summary.workspace.name} ${m.month}分`,
    ])
  }
  return toCsv(rows)
}

// MFクラウド確定申告 transaction-import columns, per MoneyForward's own
// support docs: 取引No,取引日,勘定科目,補助科目,部門,取引先,税区分,インボイス,
// 金額(円),摘要,タグ,メモ. 税区分/インボイス are left blank — they depend on
// the user's consumption-tax registration status, which this app doesn't
// track; fill in within MF before finalizing the return.
const buildMfCloudCsv = (summary: TAnnualSummary) => {
  const rows: (string | number)[][] = [
    ["取引No", "取引日", "勘定科目", "補助科目", "部門", "取引先", "税区分", "インボイス", "金額(円)", "摘要", "タグ", "メモ"],
  ]
  let transactionNo = 1
  for (const m of summary.monthly) {
    if (m.grossIncomeInclTax === 0) {
      continue
    }
    rows.push([
      transactionNo++,
      lastDayOfMonth(m.month),
      "売上高",
      "",
      "",
      summary.workspace.name,
      "",
      "",
      round(m.grossIncomeInclTax),
      `${summary.workspace.name} ${m.month}分`,
      "",
      "",
    ])
  }
  return toCsv(rows)
}

export const buildExportCsv = (summary: TAnnualSummary, format: TExportFormat): string => {
  switch (format) {
    case "freee":
      return buildFreeeCsv(summary)
    case "mfcloud":
      return buildMfCloudCsv(summary)
    case "accountant":
    default:
      return buildAccountantCsv(summary)
  }
}
