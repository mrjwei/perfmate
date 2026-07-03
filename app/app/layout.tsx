import React from "react"
import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"
import Sidebar from "@/app/ui/sidebar/sidebar"
import GlobalHeader from "@/app/ui/global-header/global-header"
import { fetchRecordsToNotify, fetchWorkspacesByUserId } from "@/app/lib/api"
import {mapRecordsToNoticifications} from '@/app/lib/helpers'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  if (!userId) {
    redirect("/login")
  }
  const [recordsToNotify, workspaces] = await Promise.all([
    fetchRecordsToNotify(userId),
    fetchWorkspacesByUserId(userId),
  ])

  return (
    <SessionProvider session={session}>
      <div className="min-h-full h-full">
        <GlobalHeader
          user={session.user}
          notifications={recordsToNotify ? mapRecordsToNoticifications(recordsToNotify) : null}
        />
        <Sidebar workspaces={workspaces} />
        <div className="flex h-full justify-end">
          <main className="relative h-full w-[calc(100%-178px)]">
            <div className="mx-auto px-10 py-24 xl:max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
