import { describe, it, expect } from "vitest"
import { dailyPlan, seasonOf } from "@/lib/server/plan"

describe("seasonOf", () => {
  it("winter for Dec/Jan/Feb (month0 11/0/1)", () => {
    expect(seasonOf(11)).toBe("winter")
    expect(seasonOf(0)).toBe("winter")
    expect(seasonOf(1)).toBe("winter")
  })
  it("spring for Mar/Apr/May (2/3/4)", () => {
    expect(seasonOf(2)).toBe("spring")
    expect(seasonOf(4)).toBe("spring")
  })
  it("summer for Jun/Jul/Aug (5/6/7)", () => {
    expect(seasonOf(5)).toBe("summer")
    expect(seasonOf(7)).toBe("summer")
  })
  it("autumn for Sep/Oct/Nov (8/9/10)", () => {
    expect(seasonOf(8)).toBe("autumn")
    expect(seasonOf(10)).toBe("autumn")
  })
})

describe("dailyPlan", () => {
  it("returns 4 todos and includes farm-specific task", () => {
    const arableAug = dailyPlan("arable", true, new Date(2026, 7, 15))
    expect(arableAug.todos).toHaveLength(4)
    expect(arableAug.todos[1].text).toMatch(/crop|pests|disease/i)
    expect(arableAug.season).toBe("summer")
  })

  it("adds sensor reminder only when sensors enabled", () => {
    const withSensors = dailyPlan("mixed", true, new Date(2026, 2, 1))
    const withoutSensors = dailyPlan("mixed", false, new Date(2026, 2, 1))
    expect(withSensors.reminders.some((r) => /sensor/i.test(r))).toBe(true)
    expect(withoutSensors.reminders.some((r) => /sensor/i.test(r))).toBe(false)
  })

  it("dairy-specific task for dairy farms", () => {
    const dairy = dailyPlan("dairy", false)
    expect(dairy.todos[1].text).toMatch(/herd|parlour/i)
  })
})
