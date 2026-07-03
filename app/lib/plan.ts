import { TPlan } from "@/app/lib/types"

// Free tier: solo-freelancer default of one workspace, no tax export.
// Pro tier (¥500–1000/mo, PLAN.md Phase 11): unlimited workspaces + tax
// export. One plan for now — no mid-tier — so this stays a flat lookup
// rather than a per-plan config table.
export const FREE_WORKSPACE_LIMIT = 1

export type TPlanAction =
  | { type: "create_workspace"; currentWorkspaceCount: number }
  | { type: "tax_export" }

export type TPlanCheck = { allowed: true } | { allowed: false; reason: string }

export const assertPlanAllows = (plan: TPlan, action: TPlanAction): TPlanCheck => {
  if (plan === "pro") {
    return { allowed: true }
  }
  switch (action.type) {
    case "create_workspace":
      if (action.currentWorkspaceCount >= FREE_WORKSPACE_LIMIT) {
        return {
          allowed: false,
          reason: `The free plan is limited to ${FREE_WORKSPACE_LIMIT} workspace. Upgrade to Pro for unlimited workspaces.`,
        }
      }
      return { allowed: true }
    case "tax_export":
      return { allowed: false, reason: "Tax export is a Pro feature. Upgrade to Pro to export your annual summary." }
  }
}
