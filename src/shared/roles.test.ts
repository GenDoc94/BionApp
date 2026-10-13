import { describe, expect, it } from "vitest"
import {
  canEditData,
  canManageApp,
  canOpenOptions,
  canUseOptionsTab,
  isRole,
} from "./roles"

describe("roles", () => {
  it("accepts the three known roles", () => {
    expect(isRole("admin")).toBe(true)
    expect(isRole("tel")).toBe(true)
    expect(isRole("user")).toBe(true)
    expect(isRole("guest")).toBe(false)
  })

  it("lets admin and TEL edit lab data", () => {
    expect(canEditData("admin")).toBe(true)
    expect(canEditData("tel")).toBe(true)
    expect(canEditData("user")).toBe(false)
  })

  it("reserves catalogs, stats, export and log for admin", () => {
    expect(canManageApp("admin")).toBe(true)
    expect(canManageApp("tel")).toBe(false)
    expect(canUseOptionsTab("tel", "perfil")).toBe(true)
    expect(canUseOptionsTab("tel", "documentos")).toBe(true)
    expect(canUseOptionsTab("tel", "variables")).toBe(false)
    expect(canUseOptionsTab("tel", "estadisticas")).toBe(false)
    expect(canUseOptionsTab("tel", "exportacion")).toBe(false)
    expect(canUseOptionsTab("tel", "registro")).toBe(false)
    expect(canOpenOptions("tel")).toBe(true)
    expect(canOpenOptions("user")).toBe(false)
  })
})
