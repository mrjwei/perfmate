import { IWorkspace } from "@/app/lib/types"
import { jpTaxModule } from "@/app/lib/tax/jp"

export type TMonthlyBreakdown = {
  month: string // "YYYY-MM"
  totalWorkMins: number
  grossIncomeExclTax: number
  grossIncomeInclTax: number
}

export type TAnnualSummary = {
  workspace: Pick<IWorkspace, "id" | "name" | "currency" | "taxcountry">
  year: string
  totalWorkMins: number
  grossIncomeExclTax: number
  grossIncomeInclTax: number
  monthly: TMonthlyBreakdown[]
}

export type TExportFormat = "accountant" | "freee" | "mfcloud"

export interface ITaxModule {
  getAnnualSummary(workspaceId: string, year: string): Promise<TAnnualSummary>
  getExportFormats(): TExportFormat[]
}

// Keyed by workspaces.tax_country. Only JP exists today (see PLAN.md Phase
// 11) — this map is the seam for a second country, not built out now.
const TAX_MODULES: Record<string, ITaxModule> = {
  JP: jpTaxModule,
}

export const getTaxModule = (taxCountry: string): ITaxModule => TAX_MODULES[taxCountry] ?? jpTaxModule
