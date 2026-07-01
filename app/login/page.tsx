import { redirect } from "next/navigation"
import LoginForm from '@/app/ui/form/login-form'
import { auth } from "@/auth"

export default async function LoginPage() {
  const session = await auth()
  if (session) {
    redirect('/app')
  }

  return (
    <div className="mx-auto py-24 max-w-lg">
      <LoginForm />
    </div>
  );
}
