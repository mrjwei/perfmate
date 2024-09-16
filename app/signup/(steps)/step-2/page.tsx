import React from 'react'
import { TSignupProps } from "@/app/lib/types"
import SignupStepTwoForm from '@/app/ui/form/signup-form-step-2'

export default function SignupStepTwo({searchParams}: TSignupProps) {
  const email = searchParams.email
  return (
    <div className="mx-auto py-24 max-w-lg">
      <SignupStepTwoForm email={email} />
    </div>
  );
}
