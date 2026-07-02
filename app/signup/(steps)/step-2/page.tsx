import React from 'react'
import { redirect } from 'next/navigation'
import ThreadForm from '@/app/ui/form/thread-form'
import { auth } from '@/auth'

export default async function SignupStepTwo() {
  const session = await auth()
  if (!session) {
    redirect('/signup/step-1')
  }
  return (
    <div className="mx-auto py-24 max-w-lg">
      <h1 className="text-center text-2xl text-muted-foreground font-bold mb-12">
        Step 2: Add your first thread
      </h1>
      <div className="rounded-lg bg-card shadow-sm p-8">
        <ThreadForm />
      </div>
    </div>
  );
}
