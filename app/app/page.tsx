import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { fetchWorkspacesByUserId } from "@/app/lib/api"

export default async function AppIndex() {
  const session = await auth()
  const userId = session!.user.id!
  const workspaces = await fetchWorkspacesByUserId(userId)
  const activeWorkspace = workspaces.find((t) => !t.archived)

  if (!activeWorkspace) {
    redirect("/app/workspaces/new")
  }
  redirect(`/app/${activeWorkspace.id}`)
}
