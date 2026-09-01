import type { Profile } from "./api"

const KEY = "steward.profile.v2"
const LEGACY_KEY = "steward.profile.v1"

export type CalendarEvent = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  kind?: "todo" | "advisory" | "weather" | "scheme"
  done?: boolean
}

export type ProfitEntry = {
  id: string
  date: string
  kind: "sale" | "cost" | "saving"
  amount: number // £, positive
  note?: string
  source?: "manual" | "auto"
}

export type ActivityLogEntry = {
  date: string
  action: string // e.g. "todo:t1", "ask:soil", "lesson:L2"
  meta?: Record<string, unknown>
}

export type ProfileV2 = Profile & {
  completed_dates: string[] // ISO YYYY-MM-DD, for streak calendar
  events: CalendarEvent[]
  profit_entries: ProfitEntry[]
  activity_log: ActivityLogEntry[]
  agent_preference: string
  voice_gender: "male" | "female"
  onboarded_at?: string
}

export const DEFAULT_PROFILE: ProfileV2 = {
  id: "default",
  name: "",
  accent: "standard",
  farm_type: "mixed",
  has_sensors: false,
  read_aloud: true,
  dark_mode: false,
  large_text: false,
  points: 0,
  turns: 0,
  streak: 0,
  badges: [],
  lesson_done: [],
  quiz_done: [],
  completed_dates: [],
  events: [],
  profit_entries: [],
  activity_log: [],
  agent_preference: "steward",
  voice_gender: "male",
}

export function loadLocalProfile(): ProfileV2 | null {
  if (typeof window === "undefined") return null
  try {
    let raw = window.localStorage.getItem(KEY)
    if (!raw) {
      // Migrate from v1 if present
      const legacy = window.localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy)
        const migrated: ProfileV2 = { ...DEFAULT_PROFILE, ...parsed }
        window.localStorage.setItem(KEY, JSON.stringify(migrated))
        return migrated
      }
      return null
    }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PROFILE, ...parsed }
  } catch {
    return null
  }
}

export function saveLocalProfile(p: ProfileV2) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(p))
}

export function clearLocalProfile() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEY)
  window.localStorage.removeItem(LEGACY_KEY)
}

export function hasOnboarded(p: ProfileV2 | Profile | null | undefined): boolean {
  return !!(p && p.name && p.accent && p.farm_type)
}

// -------- streak helpers --------
export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function markCompletionToday(p: ProfileV2): ProfileV2 {
  const t = todayIso()
  if (p.completed_dates.includes(t)) return p
  const next = { ...p, completed_dates: [...p.completed_dates, t].sort() }
  next.streak = computeStreak(next.completed_dates)
  return next
}

export function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const set = new Set(dates)
  let count = 0
  const cursor = new Date()
  // Walk back day by day
  while (true) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
    if (set.has(iso)) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      // Today itself doesn't have to be marked yet to count yesterday's streak
      if (count === 0) {
        cursor.setDate(cursor.getDate() - 1)
        const iso2 = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
        if (set.has(iso2)) {
          count++
          cursor.setDate(cursor.getDate() - 1)
          continue
        }
      }
      break
    }
  }
  return count
}

// -------- activity log helpers --------
export function pushActivity(p: ProfileV2, action: string, meta?: Record<string, unknown>): ProfileV2 {
  const entry: ActivityLogEntry = { date: todayIso(), action, meta }
  const log = [...p.activity_log, entry]
  // Cap log to last 200 entries
  const trimmed = log.length > 200 ? log.slice(log.length - 200) : log
  return { ...p, activity_log: trimmed }
}

export function behaviourSummary(p: ProfileV2): string {
  const recent = p.activity_log.slice(-30)
  if (recent.length === 0) return ""
  const counts: Record<string, number> = {}
  for (const e of recent) {
    const kind = e.action.split(":")[0]
    counts[kind] = (counts[kind] || 0) + 1
  }
  const parts: string[] = []
  parts.push(`farm type: ${p.farm_type}`)
  if (p.has_sensors) parts.push("has live sensors")
  if (p.streak > 0) parts.push(`${p.streak}-day activity streak`)
  const topKinds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
  if (topKinds.length > 0) {
    parts.push("recent activity: " + topKinds.map(([k, n]) => `${k}(${n})`).join(", "))
  }
  return parts.join("; ")
}

/** Compact snapshot of the farmer's current state to feed Gemini as context. */
export function profileContextSummary(p: ProfileV2): string {
  const t = todayIso()
  const in7 = new Date()
  in7.setDate(in7.getDate() + 7)
  const in7Iso = `${in7.getFullYear()}-${String(in7.getMonth() + 1).padStart(2, "0")}-${String(in7.getDate()).padStart(2, "0")}`
  const upcoming = p.events
    .filter((e) => e.date >= t && e.date <= in7Iso)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 8)
    .map((e) => `${e.date}: ${e.title}`)
  const parts: string[] = []
  parts.push(`Today is ${t}. Farmer is ${p.name || "unnamed"}, ${p.farm_type} farm${p.has_sensors ? ", sensors connected" : ""}.`)
  parts.push(`Level ${p.points >= 100 ? "Master Steward" : p.points >= 50 ? "Steward" : p.points >= 20 ? "Grower" : "Seedling"}, ${p.points} pts, ${p.streak}-day activity streak, ${p.badges.length} badges.`)
  if (upcoming.length > 0) {
    parts.push(`Upcoming events: ${upcoming.join(" · ")}.`)
  } else {
    parts.push("No events currently in the calendar.")
  }
  return parts.join(" ")
}

// -------- profit helpers --------
export function totalNetProfit(entries: ProfitEntry[]): number {
  return entries.reduce((sum, e) => {
    if (e.kind === "sale" || e.kind === "saving") return sum + e.amount
    return sum - e.amount
  }, 0)
}
