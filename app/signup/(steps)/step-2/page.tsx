import React from 'react'
import { redirect } from 'next/navigation'
import SignupStepTwoForm from '@/app/ui/Form/signup-form-step-2'
import { auth } from '@/auth'

export default async function SignupStepTwo() {
  const session = await auth()
  if (!session) {
    redirect('/signup/step-1')
  }
  return (
    <div className="mx-auto py-24 max-w-lg">
      <SignupStepTwoForm />
    </div>
  );
}
