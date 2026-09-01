import { describe, it, expect } from "vitest"
import { greetingFor, normaliseDialect, dialectify, ACCENTS } from "@/lib/dialect"

describe("greetingFor", () => {
  it("uses accent-appropriate greeting + name", () => {
    expect(greetingFor("geordie", "Sam")).toBe("Howay, Sam")
    expect(greetingFor("scots", "Sam")).toBe("Aye, Sam")
    expect(greetingFor("cockney", "Sam")).toBe("Oi oi, Sam")
  })

  it("falls back to Hello for unknown accent", () => {
    expect(greetingFor("martian", "Sam")).toBe("Hello, Sam")
  })

  it("uses 'friend' when name is empty", () => {
    expect(greetingFor("standard", "")).toBe("Hello, friend")
    expect(greetingFor("standard", "   ")).toBe("Hello, friend")
  })
})

describe("normaliseDialect", () => {
  it("keeps standard English intact", () => {
    expect(normaliseDialect("How is the soil?")).toBe("How is the soil?")
  })

  it("normalises Scots / Geordie farming terms", () => {
    expect(normaliseDialect("aye my wee tup")).toContain("yes")
    expect(normaliseDialect("aye my wee tup")).toContain("small")
    expect(normaliseDialect("aye my wee tup")).toContain("ram")
  })
})

describe("dialectify", () => {
  it("leaves standard accent unchanged", () => {
    expect(dialectify("Hello there", "standard")).toBe("Hello there")
  })

  it("only adds the Geordie lead and tag when includeLead:true (default is subtle)", () => {
    const subtle = dialectify("Yes, we should check the field", "geordie")
    expect(subtle.startsWith("Howay,")).toBe(false)
    const preview = dialectify("Yes, we should check the field", "geordie", { includeLead: true })
    expect(preview.startsWith("Howay,")).toBe(true)
    expect(preview).toContain("Mind how ye gan")
  })

  it("drops 'g' from -ing when accent uses ing-drop", () => {
    const out = dialectify("We are checking the field", "yorkshire")
    expect(out).toMatch(/checkin'/)
  })

  it("maps 'you' → 'ye' in Scots", () => {
    const out = dialectify("Are you sure?", "scots")
    expect(out.toLowerCase()).toContain("ye")
  })
})

describe("ACCENTS", () => {
  it("has 11 entries", () => {
    expect(ACCENTS).toHaveLength(11)
  })
  it("standard is always first", () => {
    expect(ACCENTS[0].id).toBe("standard")
  })
})
