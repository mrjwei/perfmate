import { redirect } from "@/i18n/navigation"
import { getLocale } from "next-intl/server"
import { auth } from "@/auth"
import { fetchWorkspacesByUserId } from "@/app/lib/api"

export default async function AppIndex() {
  const session = await auth()
  const userId = session!.user.id!
  const workspaces = await fetchWorkspacesByUserId(userId)
  const activeWorkspace = workspaces.find((t) => !t.archived)
  const locale = await getLocale()

  if (!activeWorkspace) {
    redirect({ href: "/app/workspaces/new", locale })
  }
  redirect({ href: `/app/${activeWorkspace!.id}`, locale })
}
