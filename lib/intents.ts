import type { AgentAction } from "./api"
import { todayIso } from "./profile"

/**
 * Client-side intent detector. When Gemini agrees to do something ("I've added
 * it to your calendar") but forgets to emit the <actions> JSON tag, we still
 * want the user's intent to actually take effect. This scans the user's message
 * for common patterns and returns a best-guess action list.
 *
 * Kept intentionally conservative — only fires on unambiguous phrasing.
 */
export function detectClientIntent(userText: string): AgentAction[] {
  const raw = userText.trim()
  if (!raw) return []
  const t = raw.toLowerCase()

  const out: AgentAction[] = []

  // "add X to calendar" / "add this event X to calendar" / "put X on the calendar"
  //  → add_event
  const calRe = /(?:can you\s+|please\s+|)(?:add|put|schedule|book)\s+(?:this\s+|the\s+|an?\s+|)(?:event\s+|)(.+?)(?:\s+(?:to|on|in|onto|into))?\s+(?:the\s+|my\s+|our\s+|)(?:calendar|schedule|planner|diary)(?:\s+(?:for|on|)\s*(today|tomorrow|next\s+\w+|this\s+\w+|\d{1,2}\s+\w+|\w+day))?\s*[.!?]?$/i
  const calMatch = raw.match(calRe)
  if (calMatch) {
    const title = cleanTitle(calMatch[1])
    const date = parseRelativeDate(calMatch[2]) ?? todayIso()
    if (title) out.push({ kind: "add_event", date, title, category: guessEventCategory(title) })
  }

  // "add X to my todo" / "add X to my list" / "add X to tasks"
  //  → add_todo
  const todoRe = /(?:can you\s+|please\s+|)(?:add|put)\s+(?:this\s+|)(.+?)(?:\s+(?:to|on|into))?\s+(?:the\s+|my\s+|our\s+|)(?:todo|to-do|to do|task|tasks|list|plan)(?:\s+list)?\s*[.!?]?$/i
  const todoMatch = raw.match(todoRe)
  if (todoMatch && out.length === 0) {
    const text = cleanTitle(todoMatch[1])
    if (text) out.push({ kind: "add_todo", text, category: guessTodoCategory(text) })
  }

  // If nothing matched but the pattern "add ... [word 'calendar' present]" appears
  // → best-effort calendar entry with today
  if (out.length === 0 && /\badd\b/i.test(t) && /\b(calendar|schedule|diary|planner)\b/i.test(t)) {
    // Strip common command words, keep the noun phrase
    const stripped = raw
      .replace(/^(?:can you\s+|please\s+)/i, "")
      .replace(/(?:add|put|schedule|book)\s+(?:this\s+|the\s+|an?\s+|)(?:event\s+|)/i, "")
      .replace(/\s+(?:to|on|in|onto|into)\s+(?:the\s+|my\s+|our\s+|)(?:calendar|schedule|planner|diary).*$/i, "")
      .replace(/[?.!]+$/, "")
      .trim()
    if (stripped) {
      out.push({ kind: "add_event", date: todayIso(), title: cleanTitle(stripped), category: guessEventCategory(stripped) })
    }
  }

  // Same fallback for todos
  if (out.length === 0 && /\badd\b/i.test(t) && /\b(todo|task|list|plan)\b/i.test(t)) {
    const stripped = raw
      .replace(/^(?:can you\s+|please\s+)/i, "")
      .replace(/(?:add|put)\s+(?:this\s+|)/i, "")
      .replace(/\s+(?:to|on|into)\s+(?:the\s+|my\s+|our\s+|)(?:todo|to-do|task|tasks|list|plan).*$/i, "")
      .replace(/[?.!]+$/, "")
      .trim()
    if (stripped) {
      out.push({ kind: "add_todo", text: cleanTitle(stripped), category: guessTodoCategory(stripped) })
    }
  }

  return out
}

function cleanTitle(s: string): string {
  return s
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

function guessEventCategory(title: string): "todo" | "advisory" | "weather" | "scheme" {
  const t = title.toLowerCase()
  if (/\b(sfi|grant|scheme|stewardship|application|deadline)\b/.test(t)) return "scheme"
  if (/\b(frost|rain|wind|forecast|weather)\b/.test(t)) return "weather"
  if (/\b(check|review|inspect|read|advisor|advice)\b/.test(t)) return "advisory"
  return "todo"
}

function guessTodoCategory(text: string): "weather" | "livestock" | "soil" | "grants" | "records" | "general" {
  const t = text.toLowerCase()
  if (/\b(frost|rain|wind|forecast|weather)\b/.test(t)) return "weather"
  if (/\b(stock|sheep|cattle|graz|flock|ewe|ram|lamb|herd|vet|calf|dog|cow)\b/.test(t)) return "livestock"
  if (/\b(soil|nutrient|water|irrigat|drill|fertilis|test)\b/.test(t)) return "soil"
  if (/\b(scheme|sfi|grant|claim|application)\b/.test(t)) return "grants"
  if (/\b(record|diary|book|map|log)\b/.test(t)) return "records"
  return "general"
}

/** Very small relative-date parser: today, tomorrow, next monday, thursday, etc. */
function parseRelativeDate(phrase: string | undefined): string | null {
  if (!phrase) return null
  const p = phrase.trim().toLowerCase()
  const now = new Date()
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

  if (p === "today") return iso(now)
  if (p === "tomorrow") return iso(new Date(now.getTime() + 86400000))

  const weekdayIdx: Record<string, number> = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2, tues: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4, thurs: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
  }
  const cleaned = p.replace(/^(?:next|this)\s+/, "")
  if (cleaned in weekdayIdx) {
    const target = weekdayIdx[cleaned]
    const cur = now.getDay()
    let delta = (target - cur + 7) % 7
    if (delta === 0 || /^next\s+/.test(p)) delta = delta === 0 ? 7 : delta
    const d = new Date(now.getTime() + delta * 86400000)
    return iso(d)
  }

  return null
}
