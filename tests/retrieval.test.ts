import { describe, it, expect } from "vitest"
import { retrieve, confidenceLabel, composeOffline } from "@/lib/server/retrieval"

describe("retrieve", () => {
  it("finds irrigation KB doc for water questions", () => {
    const hits = retrieve("Do I need to irrigate today?")
    expect(hits.length).toBeGreaterThan(0)
    const ids = hits.map((h) => h.doc.id)
    expect(ids).toContain("KB17")
  })

  it("finds wellbeing KB doc for stress questions", () => {
    const hits = retrieve("I feel really worried and lonely lately")
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.map((h) => h.doc.id)).toContain("KB05")
  })

  it("finds SFI/schemes KB doc for grant questions", () => {
    const hits = retrieve("Can I still apply for the SFI grant?")
    const ids = hits.map((h) => h.doc.id)
    expect(ids.some((id) => id === "KB01" || id === "KB02")).toBe(true)
  })

  it("returns empty or weak hits for nonsense", () => {
    const hits = retrieve("xylophone spaceship purple monkey dishwasher")
    const top = hits[0]?.score ?? 0
    expect(top).toBeLessThan(0.06)
  })
})

describe("confidenceLabel", () => {
  it("high when strong + multiple hits", () => {
    expect(confidenceLabel(0.35, 3)).toBe("high")
  })
  it("medium in the middle band", () => {
    expect(confidenceLabel(0.2, 3)).toBe("medium")
  })
  it("low for weak scores", () => {
    expect(confidenceLabel(0.05, 1)).toBe("low")
  })
})

describe("composeOffline abstention", () => {
  it("abstains when no hits are strong enough", () => {
    const offline = composeOffline([])
    expect(offline.abstained).toBe(true)
    expect(offline.sources).toEqual([])
    expect(offline.answer).toMatch(/not sure/i)
  })

  it("composes an answer with citations from strong hits", () => {
    const hits = retrieve("Do I need to irrigate today?")
    const offline = composeOffline(hits)
    expect(offline.abstained).toBe(false)
    expect(offline.sources.length).toBeGreaterThan(0)
    expect(offline.answer.length).toBeGreaterThan(20)
  })

  it("prepends sensor context when supplied", () => {
    const hits = retrieve("Do I need to irrigate today?")
    const offline = composeOffline(hits, "Soil moisture is 15%.")
    expect(offline.answer).toContain("Soil moisture is 15%.")
  })
})
