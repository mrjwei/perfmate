import { TSignupProps } from "@/app/lib/types"
import SignupStepTwoForm from '@/app/ui/form/signup-form-step-2'

export default function SignupStepTwo({searchParams}: TSignupProps) {
  const userid = searchParams.userid
  return (
    <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
          </div>
        </div>
        <SignupStepTwoForm userId={userid} />
      </div>
  );
}
