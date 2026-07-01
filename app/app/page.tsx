import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { fetchThreadsByUserId } from "@/app/lib/api"

export default async function AppIndex() {
  const session = await auth()
  const userId = session!.user.id!
  const threads = await fetchThreadsByUserId(userId)
  const activeThread = threads.find((t) => !t.archived)

  if (!activeThread) {
    redirect("/app/threads/new")
  }
  redirect(`/app/${activeThread.id}`)
}
