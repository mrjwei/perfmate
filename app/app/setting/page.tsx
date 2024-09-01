import React from 'react'
import SettingForm from '@/app/ui/setting/setting-form'
import { auth } from "@/auth"
import { Session } from "next-auth"

export default async function Settings() {
  const {user} = await auth() as Session

  return (
    <>
      <h2 className="text-3xl font-bold mb-12">Setting</h2>
      <SettingForm user={user} />
    </>
  )
}
