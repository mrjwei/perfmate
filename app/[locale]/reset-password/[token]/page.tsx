import React from "react"
import ResetPasswordForm from "@/app/ui/form/reset-password-form"

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return (
    <div className="mx-auto py-24 max-w-lg">
      <ResetPasswordForm token={token} />
    </div>
  )
}
