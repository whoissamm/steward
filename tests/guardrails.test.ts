import { describe, it, expect } from "vitest"
import { checkGuards, normaliseDialect } from "@/lib/server/guardrails"

describe("guardrails", () => {
  it("blocks wormer dose questions", () => {
    const r = checkGuards("What is the wormer dose for my sheep?")
    expect(r.blocked).toBe(true)
    expect(r.isCrisis).toBe(false)
    expect(r.message).toMatch(/vet|BASIS/i)
  })

  it("blocks vaccinate questions", () => {
    const r = checkGuards("Should I vaccinate now?")
    expect(r.blocked).toBe(true)
    expect(r.isCrisis).toBe(false)
  })

  it("blocks pesticide rate questions", () => {
    const r = checkGuards("What spray rate should I use for this herbicide?")
    expect(r.blocked).toBe(true)
  })

  it("blocks fallen-stock disposal", () => {
    const r = checkGuards("Can I bury the carcass?")
    expect(r.blocked).toBe(true)
  })

  it("detects crisis language", () => {
    const r = checkGuards("I want to die")
    expect(r.blocked).toBe(true)
    expect(r.isCrisis).toBe(true)
    expect(r.message).toMatch(/03000 111 999/)
  })

  it("passes normal farm questions", () => {
    expect(checkGuards("How do I improve my soil?").blocked).toBe(false)
    expect(checkGuards("Should I irrigate today?").blocked).toBe(false)
  })
})

describe("normaliseDialect", () => {
  it("maps common regional terms to standard English", () => {
    expect(normaliseDialect("aye we ken it")).toContain("yes")
    expect(normaliseDialect("aye we ken it")).toContain("know")
    expect(normaliseDialect("tup and yow")).toContain("ram")
    expect(normaliseDialect("tup and yow")).toContain("ewe")
    expect(normaliseDialect("wee cannae")).toContain("small")
    expect(normaliseDialect("wee cannae")).toContain("cannot")
  })

  it("preserves capitalisation on the first letter", () => {
    expect(normaliseDialect("Aye")).toBe("Yes")
    expect(normaliseDialect("Wee")).toBe("Small")
  })

  it("leaves non-dialect words alone", () => {
    expect(normaliseDialect("farm sensors")).toBe("farm sensors")
  })
})
