import React from "react"
import Link from "next/link"
import { auth } from "@/auth"
import { fetchThreadsByUserId } from "@/app/lib/api"
import { archiveThread, unarchiveThread } from "@/app/lib/actions"
import { mapCurrencyToMark } from "@/app/lib/helpers"
import { Button } from "@/components/ui/button"

export default async function ThreadsPage() {
  const session = await auth()
  const threads = await fetchThreadsByUserId(session!.user.id!)
  const activeThreads = threads.filter((t) => !t.archived)
  const archivedThreads = threads.filter((t) => t.archived)

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Threads</h2>
        <Link
          href="/app/threads/new"
          className="px-4 py-2 text-primary-foreground bg-primary rounded-lg"
        >
          Add thread
        </Link>
      </div>
      <ul className="bg-card rounded-lg shadow-sm divide-y divide-border">
        {activeThreads.map((t) => (
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
              <form action={archiveThread.bind(null, t.id)}>
                <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">Archive</Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {archivedThreads.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-muted-foreground">Archived</h3>
          <ul className="bg-card rounded-lg shadow-sm divide-y divide-border">
            {archivedThreads.map((t) => (
              <li key={t.id} className="flex items-center justify-between p-4 text-muted-foreground">
                <span>{t.name}</span>
                <form action={unarchiveThread.bind(null, t.id)}>
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
