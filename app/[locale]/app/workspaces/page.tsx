import React from "react"
import { Link } from "@/i18n/navigation"
import { auth } from "@/auth"
import { fetchWorkspacesByUserId } from "@/app/lib/api"
import { archiveWorkspace, unarchiveWorkspace } from "@/app/lib/actions"
import { mapCurrencyToMark } from "@/app/lib/helpers"
import { Button } from "@/components/ui/button"

export default async function WorkspacesPage() {
  const session = await auth()
  const workspaces = await fetchWorkspacesByUserId(session!.user.id!)
  const activeWorkspaces = workspaces.filter((t) => !t.archived)
  const archivedWorkspaces = workspaces.filter((t) => t.archived)

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Workspaces</h2>
        <Link
          href="/app/workspaces/new"
          className="px-4 py-2 text-primary-foreground bg-primary rounded-lg"
        >
          Add workspace
        </Link>
      </div>
      <ul className="bg-card rounded-lg shadow-sm divide-y divide-border">
        {activeWorkspaces.map((t) => (
          <li key={t.id} className="flex items-center justify-between p-4">
            <Link href={`/app/${t.id}`} className="font-medium">
              {t.name}
              <span className="ml-2 text-muted-foreground text-sm">
                {mapCurrencyToMark(t.currency)}{t.hourlywage}/hr
              </span>
            </Link>
            <div className="flex items-center">
              <Link href={`/app/${t.id}/settings`} className="text-primary mr-4">
                Edit
              </Link>
              <form action={archiveWorkspace.bind(null, t.id)}>
                <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">Archive</Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {archivedWorkspaces.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-muted-foreground">Archived</h3>
          <ul className="bg-card rounded-lg shadow-sm divide-y divide-border">
            {archivedWorkspaces.map((t) => (
              <li key={t.id} className="flex items-center justify-between p-4 text-muted-foreground">
                <span>{t.name}</span>
                <form action={unarchiveWorkspace.bind(null, t.id)}>
                  <Button type="submit" variant="ghost" className="text-primary">Unarchive</Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
