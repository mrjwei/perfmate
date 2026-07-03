import React from "react"
import WorkspaceForm from "@/app/ui/form/workspace-form"

export default function NewWorkspacePage() {
  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-3xl font-bold mb-12">Add workspace</h2>
      <div className="rounded-lg bg-card shadow-sm p-8">
        <WorkspaceForm />
      </div>
    </div>
  )
}
