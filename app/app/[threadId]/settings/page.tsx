import React from "react"
import { notFound } from "next/navigation"
import { fetchThreadById } from "@/app/lib/api"
import ThreadForm from "@/app/ui/form/thread-form"

export default async function ThreadSettingsPage({ params }: { params: { threadId: string } }) {
  const thread = await fetchThreadById(params.threadId)
  if (!thread) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-3xl font-bold mb-12">Thread settings</h2>
      <div className="rounded-lg bg-white shadow p-8">
        <ThreadForm thread={thread} />
      </div>
    </div>
  )
}
