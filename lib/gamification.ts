// Client mirror of backend gamification for immediate UI feedback
// (badges/levels/xp bar). Authoritative points still come from /api/progress.

export const LEVELS: [number, string][] = [
  [0, "Seedling"],
  [20, "Grower"],
  [50, "Steward"],
  [100, "Master Steward"],
]

export type BadgeMeta = { id: string; name: string; description: string; icon: string }

export const BADGES: Record<string, BadgeMeta> = {
  curious: { id: "curious", name: "Curious Farmer", description: "Asked 3 questions", icon: "🌱" },
  data: { id: "data", name: "Data Driven", description: "Used sensor data in a question", icon: "📊" },
  careful: { id: "careful", name: "Careful Thinker", description: "Encountered a guardrail or abstention", icon: "🛡️" },
  market: { id: "market", name: "Market Minded", description: "Asked about selling", icon: "🛒" },
  voice: { id: "voice", name: "Voice User", description: "Used voice input", icon: "🎤" },
  scholar: { id: "scholar", name: "Scholar", description: "Reached Steward level", icon: "⭐" },
}

export const ALL_BADGE_IDS = Object.keys(BADGES)

export function levelFor(points: number): string {
  let label = "Seedling"
  for (const [threshold, name] of LEVELS) {
    if (points >= threshold) label = name
  }
  return label
}

export function nextLevel(points: number): { name: string; needed: number; progress: number } | null {
  for (const [threshold, name] of LEVELS) {
    if (points < threshold) {
      const prev = [...LEVELS].reverse().find(([t]) => t <= points)!
      const span = threshold - prev[0]
      const progressed = points - prev[0]
      return { name, needed: threshold - points, progress: span > 0 ? progressed / span : 1 }
    }
  }
  return null // Already Master Steward
}
