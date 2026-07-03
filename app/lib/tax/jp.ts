import { fetchRecordsByWorkspaceIdAndYear, fetchWorkspaceById } from "@/app/lib/api"
import { calculateMonthlyTotalWorkMins, calculateWage, dateStrToMonthStr } from "@/app/lib/helpers"
import type { ITaxModule, TAnnualSummary, TExportFormat, TMonthlyBreakdown } from "@/app/lib/tax"

// 確定申告's 収支内訳書/青色申告決算書-style breakdown: gross income (this app
// tracks income only, no expenses), totalled per workspace and broken down
// by month for the given tax year.
export const getAnnualSummary = async (workspaceId: string, year: string): Promise<TAnnualSummary> => {
  const workspace = await fetchWorkspaceById(workspaceId)
  if (!workspace) {
    throw new Error(`Workspace ${workspaceId} not found`)
  }
  const records = await fetchRecordsByWorkspaceIdAndYear(workspaceId, year)

  const recordsByMonth = new Map<string, typeof records>()
  for (const record of records) {
    const month = dateStrToMonthStr(record.date)
    const monthRecords = recordsByMonth.get(month) ?? []
    monthRecords.push(record)
    recordsByMonth.set(month, monthRecords)
  }

  const monthly: TMonthlyBreakdown[] = Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, "0")}`
    const monthRecords = recordsByMonth.get(month) ?? []
    const totalWorkMins = calculateMonthlyTotalWorkMins(monthRecords)
    const { exclTax, inclTax } = calculateWage(totalWorkMins, workspace)
    return { month, totalWorkMins, grossIncomeExclTax: exclTax, grossIncomeInclTax: inclTax }
  })

  const totalWorkMins = monthly.reduce((acc, m) => acc + m.totalWorkMins, 0)
  const { exclTax: grossIncomeExclTax, inclTax: grossIncomeInclTax } = calculateWage(totalWorkMins, workspace)

  return {
    workspace: { id: workspace.id, name: workspace.name, currency: workspace.currency, taxcountry: workspace.taxcountry },
    year,
    totalWorkMins,
    grossIncomeExclTax,
    grossIncomeInclTax,
    monthly,
  }
}

const getExportFormats = (): TExportFormat[] => ["accountant", "freee", "mfcloud"]

export const jpTaxModule: ITaxModule = { getAnnualSummary, getExportFormats }
