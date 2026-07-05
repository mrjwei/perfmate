import { describe, it, expect } from "vitest"
import { isAdminRole } from "@/app/lib/admin"

describe("isAdminRole", () => {
  it("is true for the admin role", () => {
    expect(isAdminRole("admin")).toBe(true)
  })

  it("is false for the default user role", () => {
    expect(isAdminRole("user")).toBe(false)
  })

  it("is false for undefined/null role", () => {
    expect(isAdminRole(undefined)).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })
})
