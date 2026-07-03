import { describe, it, expect } from "vitest"
import { assertPlanAllows, FREE_WORKSPACE_LIMIT } from "@/app/lib/plan"

describe("assertPlanAllows", () => {
  it("allows creating a workspace on the free plan under the limit", () => {
    const result = assertPlanAllows("free", { type: "create_workspace", currentWorkspaceCount: 0 })
    expect(result.allowed).toBe(true)
  })

  it("blocks creating a workspace on the free plan at the limit", () => {
    const result = assertPlanAllows("free", {
      type: "create_workspace",
      currentWorkspaceCount: FREE_WORKSPACE_LIMIT,
    })
    expect(result.allowed).toBe(false)
  })

  it("blocks tax export on the free plan", () => {
    const result = assertPlanAllows("free", { type: "tax_export" })
    expect(result.allowed).toBe(false)
  })

  it("allows unlimited workspaces on the pro plan", () => {
    const result = assertPlanAllows("pro", { type: "create_workspace", currentWorkspaceCount: 50 })
    expect(result.allowed).toBe(true)
  })

  it("allows tax export on the pro plan", () => {
    const result = assertPlanAllows("pro", { type: "tax_export" })
    expect(result.allowed).toBe(true)
  })
})
