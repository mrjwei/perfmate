import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { fetchUserPlanInfo, fetchWorkspaceById } from "@/app/lib/api"
import { assertPlanAllows } from "@/app/lib/plan"
import { getTaxModule, TExportFormat } from "@/app/lib/tax"
import { buildExportCsv } from "@/app/lib/export"
import { buildAnnualSummaryPdf } from "@/app/lib/invoice"

const CSV_FORMATS: TExportFormat[] = ["accountant", "freee", "mfcloud"]

// RFC 5987-encoded filename* so non-ASCII workspace names (e.g. Japanese)
// survive in the Content-Disposition header; the plain `filename` fallback
// is ASCII-only for older clients.
const contentDisposition = (asciiName: string, fullName: string) =>
  `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fullName)}`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; workspaceId: string }> }
) {
  const { locale, workspaceId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const workspace = await fetchWorkspaceById(workspaceId)
  if (!workspace || workspace.userid !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const planInfo = await fetchUserPlanInfo(session.user.id)
  const planCheck = assertPlanAllows(planInfo?.plan ?? "free", { type: "tax_export" })
  if (!planCheck.allowed) {
    return NextResponse.json({ error: planCheck.reason }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get("year") ?? String(new Date().getUTCFullYear())
  const format = searchParams.get("format") ?? "accountant"

  const taxModule = getTaxModule(workspace.taxcountry)
  const summary = await taxModule.getAnnualSummary(workspaceId, year)
  const asciiName = `perfmate-export-${year}`

  if (format === "pdf") {
    const pdf = await buildAnnualSummaryPdf(summary, locale)
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition(`${asciiName}.pdf`, `${workspace.name}-${year}.pdf`),
      },
    })
  }

  if (!CSV_FORMATS.includes(format as TExportFormat)) {
    return NextResponse.json({ error: "Unknown export format" }, { status: 400 })
  }
  const csv = buildExportCsv(summary, format as TExportFormat)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": contentDisposition(`${asciiName}-${format}.csv`, `${workspace.name}-${year}-${format}.csv`),
    },
  })
}
