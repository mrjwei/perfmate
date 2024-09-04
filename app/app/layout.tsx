import React from 'react'
import { redirect } from "next/navigation"
import type {User} from 'next-auth'
import {SessionProvider} from 'next-auth/react'
import { auth } from "@/auth"
import Sidebar from "@/app/ui/sidebar/sidebar"
import GlobalHeader from "@/app/ui/global-header/global-header"
import { fetchUserByEmail } from "../lib/api"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }
  const user = await fetchUserByEmail(session.user.email!)
  session.user = user as User

  return (
    <SessionProvider session={session}>
      <div className="min-h-full">
        <GlobalHeader user={session.user} />
        <div className="flex">
          <Sidebar />
          <main className="relative mx-auto py-12 w-2/3 xl:w-3/5 2xl:w-2/5">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
