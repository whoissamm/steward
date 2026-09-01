import { describe, it, expect } from "vitest"
import { classifyTopic, followupsFor, isMarketQuery } from "@/lib/server/topics"

describe("classifyTopic", () => {
  it.each([
    ["schemes",      "Can I still apply for SFI?"],
    ["market",       "How do I sell direct to customers?"],
    ["soil",         "How do I improve my soil health?"],
    ["livestock",    "What should I feed my ewes?"],
    ["weather",      "Is there a frost risk tonight?"],
    ["tech",         "How does AI help precision farming?"],
    ["wellbeing",    "I feel really stressed and worried"],
    ["connectivity", "Rural broadband is terrible here"],
  ])("classifies %s from %s", (topic, question) => {
    expect(classifyTopic(question)).toBe(topic)
  })

  it("falls back to schemes when nothing matches", () => {
    expect(classifyTopic("hello there")).toBe("schemes")
  })
})

describe("followupsFor", () => {
  it("returns 2 follow-up prompts per topic", () => {
    expect(followupsFor("soil")).toHaveLength(2)
    expect(followupsFor("weather")).toHaveLength(2)
  })
  it("falls back for unknown topics", () => {
    expect(followupsFor("unknown")).toHaveLength(2)
  })
})

describe("isMarketQuery", () => {
  it("matches selling / market terms", () => {
    expect(isMarketQuery("How do I sell my produce?")).toBe(true)
    expect(isMarketQuery("box scheme margin?")).toBe(true)
  })
  it("does not match unrelated", () => {
    expect(isMarketQuery("frost risk tonight?")).toBe(false)
  })
})
