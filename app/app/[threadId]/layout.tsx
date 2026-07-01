import React from "react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { fetchThreadById } from "@/app/lib/api"

export default async function ThreadLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { threadId: string }
}) {
  const session = await auth()
  const thread = await fetchThreadById(params.threadId)

  if (!thread || thread.userid !== session?.user.id) {
    notFound()
  }

  return <>{children}</>
}
