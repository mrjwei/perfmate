import React from 'react'
import type {User} from 'next-auth'
import SettingForm from '@/app/ui/setting/setting-form'
import { auth } from "@/auth"
import { fetchUserByEmail } from "@/app/lib/api"

export default async function Settings() {
  const session = await auth()
  const user = await fetchUserByEmail(session?.user.email!) as User

  return (
    <>
      <h2 className="text-3xl font-bold mb-12">Setting</h2>
      <SettingForm user={user} />
    </>
  )
}
