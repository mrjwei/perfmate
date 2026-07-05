import React from "react"
import { redirect } from "@/i18n/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { auth } from "@/auth"
import { isAdminRole } from "@/app/lib/admin"
import { fetchAllUsersForAdmin } from "@/app/lib/api"

const stripeDashboardUrl = (stripeCustomerId: string) => {
  const isTestMode = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test")
  const base = isTestMode ? "https://dashboard.stripe.com/test/customers" : "https://dashboard.stripe.com/customers"
  return `${base}/${stripeCustomerId}`
}

export default async function AdminPage() {
  const session = await auth()
  const locale = await getLocale()

  if (!isAdminRole(session?.user.role)) {
    redirect({ href: "/app", locale })
  }

  const t = await getTranslations("Admin")
  const users = await fetchAllUsersForAdmin()

  return (
    <div className="pb-8">
      <h2 className="text-3xl font-bold mb-8">{t("title")}</h2>
      <div className="bg-card rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-4 font-medium">{t("name")}</th>
              <th className="p-4 font-medium">{t("email")}</th>
              <th className="p-4 font-medium">{t("plan")}</th>
              <th className="p-4 font-medium">{t("workspaces")}</th>
              <th className="p-4 font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">
                  {u.plan === "pro" ? t("proPlan") : t("freePlan")}
                  {u.planStatus && u.planStatus !== "active" && (
                    <span className="ml-2 text-muted-foreground">({u.planStatus})</span>
                  )}
                </td>
                <td className="p-4">{u.workspaceCount}</td>
                <td className="p-4">
                  <a href={`mailto:${u.email}`} className="text-primary mr-4">
                    {t("emailUser")}
                  </a>
                  {u.stripeCustomerId && (
                    <a
                      href={stripeDashboardUrl(u.stripeCustomerId)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary"
                    >
                      {t("viewInStripe")}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
