import { redirect } from "next/navigation"
import LoginForm from '@/app/ui/form/login-form'
import { auth } from "@/auth"

export default async function LoginPage() {
  const session = await auth()
  if (session) {
    redirect('/app')
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
          </div>
        </div>
        <LoginForm />
      </div>
  );
}
