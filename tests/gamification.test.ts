import { describe, it, expect } from "vitest"
import { levelFor, tipForTurn, checkBadges } from "@/lib/server/gamification"
import { nextLevel } from "@/lib/gamification"

describe("levelFor", () => {
  it("maps points to correct label", () => {
    expect(levelFor(0)).toBe("Seedling")
    expect(levelFor(19)).toBe("Seedling")
    expect(levelFor(20)).toBe("Grower")
    expect(levelFor(49)).toBe("Grower")
    expect(levelFor(50)).toBe("Steward")
    expect(levelFor(99)).toBe("Steward")
    expect(levelFor(100)).toBe("Master Steward")
    expect(levelFor(9999)).toBe("Master Steward")
  })
})

describe("nextLevel", () => {
  it("shows remaining points and progress fraction", () => {
    const at10 = nextLevel(10)
    expect(at10?.name).toBe("Grower")
    expect(at10?.needed).toBe(10)
    expect(at10?.progress).toBeCloseTo(0.5, 5)
  })

  it("returns null at max level", () => {
    expect(nextLevel(9999)).toBeNull()
  })
})

describe("checkBadges", () => {
  it("awards curious after 3 turns", () => {
    expect(checkBadges({ turns: 3, points: 0, badges: [] })).toContain("curious")
    expect(checkBadges({ turns: 2, points: 0, badges: [] })).not.toContain("curious")
  })

  it("awards scholar at Steward level", () => {
    expect(checkBadges({ turns: 0, points: 50, badges: [] })).toContain("scholar")
    expect(checkBadges({ turns: 0, points: 49, badges: [] })).not.toContain("scholar")
  })

  it("does not re-award already-earned badges", () => {
    const out = checkBadges({ turns: 3, points: 50, badges: ["curious", "scholar"] })
    expect(out).not.toContain("curious")
    expect(out).not.toContain("scholar")
  })
})

describe("tipForTurn", () => {
  it("returns a non-empty tip", () => {
    expect(tipForTurn(0).length).toBeGreaterThan(10)
    expect(tipForTurn(5).length).toBeGreaterThan(10)
  })
  it("cycles through tips", () => {
    const a = tipForTurn(0)
    const b = tipForTurn(2)
    expect(a).not.toBe(b)
  })
})
