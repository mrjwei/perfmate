import React from "react"
import { notFound } from "next/navigation"
import { fetchWorkspaceById } from "@/app/lib/api"
import WorkspaceForm from "@/app/ui/form/workspace-form"

export default async function WorkspaceSettingsPage({ params }: { params: { workspaceId: string } }) {
  const workspace = await fetchWorkspaceById(params.workspaceId)
  if (!workspace) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-3xl font-bold mb-12">Workspace settings</h2>
      <div className="rounded-lg bg-card shadow-sm p-8">
        <WorkspaceForm workspace={workspace} />
      </div>
    </div>
  )
}
