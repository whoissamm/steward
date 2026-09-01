import { describe, it, expect } from "vitest"
import { getReadings, sensorContextForQuestion } from "@/lib/server/sensors"

describe("getReadings", () => {
  it("returns all expected numeric fields within realistic bounds", () => {
    const r = getReadings()
    expect(typeof r.soil_moisture).toBe("number")
    expect(r.soil_moisture).toBeGreaterThanOrEqual(12)
    expect(r.soil_moisture).toBeLessThanOrEqual(40)
    expect(r.air_temp).toBeGreaterThanOrEqual(4)
    expect(r.air_temp).toBeLessThanOrEqual(22)
    expect(r.wind).toBeGreaterThanOrEqual(2)
    expect(r.wind).toBeLessThanOrEqual(34)
    expect(r.history.length).toBe(8)
  })

  it("is deterministic within a 4-second window", () => {
    const now = new Date(1735689600000) // fixed instant
    const a = getReadings(now)
    const b = getReadings(new Date(now.getTime() + 1000))
    expect(a).toEqual(b)
  })

  it("returns an alerts array (may be empty)", () => {
    expect(Array.isArray(getReadings().alerts)).toBe(true)
  })
})

describe("sensorContextForQuestion", () => {
  const readings = {
    soil_moisture: 15,
    soil_temp: 8,
    air_temp: 10,
    rain_24h: 0.5,
    rain_forecast: 2,
    wind: 20,
    history: [15, 16, 15, 14, 15, 16, 15, 15],
    alerts: [] as { level: "info" | "warning"; message: string }[],
  }

  it("returns empty string for unrelated questions", () => {
    expect(sensorContextForQuestion("What is SFI?", readings)).toBe("")
  })

  it("returns full context for water/spray questions and includes advice", () => {
    const c = sensorContextForQuestion("Should I irrigate today?", readings)
    expect(c).toContain("Soil moisture is 15%")
    expect(c).toContain("Irrigation looks advisable")
  })

  it("flags no-spray when wind above 19 kph", () => {
    const c = sensorContextForQuestion("Can I spray today?", readings)
    expect(c).toContain("Too windy")
  })

  it("flags frost risk when air_temp ≤ 2", () => {
    const cold = { ...readings, air_temp: 1 }
    const c = sensorContextForQuestion("Is there a frost risk?", cold)
    expect(c).toContain("Frost risk: yes")
  })
})
