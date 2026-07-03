import React from 'react'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import WorkspaceForm from '@/app/ui/form/workspace-form'
import { auth } from '@/auth'

export default async function SignupStepTwo() {
  const session = await auth()
  if (!session) {
    redirect({ href: '/signup/step-1', locale: await getLocale() })
  }
  const t = await getTranslations('Auth.signup')
  return (
    <div className="mx-auto py-24 max-w-lg">
      <h1 className="text-center text-2xl text-muted-foreground font-bold mb-12">
        {t('step2Title')}
      </h1>
      <div className="rounded-lg bg-card shadow-sm p-8">
        <WorkspaceForm />
      </div>
    </div>
  );
}
