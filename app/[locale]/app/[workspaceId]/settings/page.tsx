import React from "react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { fetchUserPlanInfo, fetchWorkspaceById } from "@/app/lib/api"
import WorkspaceForm from "@/app/ui/form/workspace-form"
import TaxExportSection from "@/app/ui/setting/tax-export-section"

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const workspace = await fetchWorkspaceById(workspaceId)
  if (!workspace) {
    notFound()
  }
  const session = await auth()
  const planInfo = await fetchUserPlanInfo(session!.user.id!)

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-3xl font-bold mb-12">Workspace settings</h2>
      <div className="rounded-lg bg-card shadow-sm p-8">
        <WorkspaceForm workspace={workspace} />
      </div>
      <TaxExportSection workspaceId={workspace.id} plan={planInfo?.plan ?? "free"} />
    </div>
  )
}
