// Server-side mirror of client gamification (kept in sync).
// The API routes need it for /api/ask (badge awards on question) and /api/progress
// (badge awards on todo/lesson/quiz).

export const LEVELS: [number, string][] = [
  [0, "Seedling"],
  [20, "Grower"],
  [50, "Steward"],
  [100, "Master Steward"],
]

export type BadgeId = "curious" | "data" | "careful" | "market" | "voice" | "scholar"

export const LITERACY_TIPS = [
  "The confidence level tells you how sure the tool is — treat 'low' as a nudge to double-check.",
  "Every answer shows its sources, so you can always see where it came from.",
  "When Steward says 'I am not sure', that is a feature — it will not guess at your expense.",
  "With sensors connected, try asking 'Do I need to water today?'",
  "For anything a vet or agronomist must decide, Steward steps back and points you to a person.",
]

export function levelFor(points: number): string {
  let label = "Seedling"
  for (const [threshold, name] of LEVELS) if (points >= threshold) label = name
  return label
}

export function tipForTurn(turn: number): string {
  return LITERACY_TIPS[Math.floor(turn / 2) % LITERACY_TIPS.length]
}

export type ProfileInput = {
  turns?: number
  points?: number
  badges?: string[]
}

export function checkBadges(profile: ProfileInput): string[] {
  const earned = new Set(profile.badges ?? [])
  const turns = profile.turns ?? 0
  const points = profile.points ?? 0
  const out: string[] = []
  if (turns >= 3 && !earned.has("curious")) out.push("curious")
  const lvl = levelFor(points)
  if ((lvl === "Steward" || lvl === "Master Steward") && !earned.has("scholar")) out.push("scholar")
  return out
}
