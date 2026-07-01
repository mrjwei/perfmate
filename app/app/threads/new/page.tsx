import React from "react"
import ThreadForm from "@/app/ui/form/thread-form"

export default function NewThreadPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-3xl font-bold mb-12">Add thread</h2>
      <div className="rounded-lg bg-white shadow p-8">
        <ThreadForm />
      </div>
    </div>
  )
}
