import React from "react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { fetchWorkspaceById } from "@/app/lib/api"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { workspaceId: string }
}) {
  const session = await auth()
  const workspace = await fetchWorkspaceById(params.workspaceId)

  if (!workspace || workspace.userid !== session?.user.id) {
    notFound()
  }

  return <>{children}</>
}
