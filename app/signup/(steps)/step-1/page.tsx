import React from 'react'
import SignupStepOneForm from '@/app/ui/form/signup-form-step-1'

export default function SignupStepOne() {
  return (
    <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
          </div>
        </div>
        <SignupStepOneForm />
      </div>
  );
}
