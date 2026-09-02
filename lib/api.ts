// Same-origin fetch wrapper. When the app is served from Vercel, /api/* routes are colocated.

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""

export type Profile = {
  id: string
  name: string
  accent: string
  farm_type: string
  has_sensors: boolean
  read_aloud: boolean
  dark_mode: boolean
  large_text: boolean
  points: number
  turns: number
  streak: number
  badges: string[]
  lesson_done: string[]
  quiz_done: string[]
}

export type AskResponse = {
  answer: string
  sources: string[]
  confidence: "high" | "medium" | "low"
  topic: string
  why: string
  abstained: boolean
  blocked: boolean
  is_crisis: boolean
  followups: string[]
  tip: string | null
  new_badges: string[]
  points_earned: number
  total_points: number
  level: string
  agent?: string
  llm?: "gemini" | "offline_tfidf" | "guardrail"
  actions?: AgentAction[]
}

export type AgentAction =
  | { kind: "add_event"; date: string; title: string; category?: "todo" | "advisory" | "weather" | "scheme" }
  | { kind: "add_todo"; text: string; category?: "weather" | "livestock" | "soil" | "grants" | "records" | "general" }
  | { kind: "mark_todo_done"; id_or_text: string }
  | { kind: "log_note"; text: string }

export type PlanTodo = { id: string; text: string; done: boolean }
export type PlanResponse = { todos: PlanTodo[]; reminders: string[]; season: string }

export type SensorAlert = { level: "info" | "warning"; message: string }
export type SensorReadings = {
  soil_moisture: number
  soil_temp: number
  air_temp: number
  rain_24h: number
  rain_forecast: number
  wind: number
  history: number[]
  alerts: SensorAlert[]
}

export type ProgressAction =
  | "todo_done"
  | "lesson_done"
  | "quiz_correct"
  | "voice_used"
  | "market_query"

export type ProgressResponse = {
  points: number
  total_points: number
  level: string
  new_badges: string[]
  tip: string | null
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) msg = body.error
    } catch {
      // Non-JSON body — ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

export const api = {
  async health(): Promise<{ status: string; llm: string }> {
    return jsonFetch("/api/health")
  },
  async ask(
    text: string,
    profile?: Profile,
    opts?: {
      agentId?: string
      behaviourSummary?: string
      profileContext?: string
      voiceGender?: "male" | "female"
      imageBase64?: string
      imageMime?: string
    },
  ): Promise<AskResponse> {
    const slim = profile
      ? {
          id: profile.id,
          points: profile.points,
          turns: profile.turns,
          badges: profile.badges,
          has_sensors: profile.has_sensors,
        }
      : null
    return jsonFetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({
        text,
        profile: slim,
        agent_id: opts?.agentId,
        behaviour_summary: opts?.behaviourSummary,
        profile_context: opts?.profileContext,
        voice_gender: opts?.voiceGender,
        image_base64: opts?.imageBase64,
        image_mime: opts?.imageMime,
      }),
    })
  },
  async plan(farm = "mixed", hasSensors = false): Promise<PlanResponse> {
    const q = `?farm=${encodeURIComponent(farm)}&has_sensors=${hasSensors}`
    return jsonFetch(`/api/plan${q}`)
  },
  async sensors(): Promise<SensorReadings> {
    return jsonFetch("/api/sensors")
  },
  async progress(
    action: ProgressAction,
    itemId?: string,
    profile?: Profile,
  ): Promise<ProgressResponse> {
    const slim = profile
      ? {
          points: profile.points,
          turns: profile.turns,
          badges: profile.badges,
          lesson_done: profile.lesson_done,
          quiz_done: profile.quiz_done,
        }
      : {}
    return jsonFetch("/api/progress", {
      method: "POST",
      body: JSON.stringify({ action, item_id: itemId ?? null, profile: slim }),
    })
  },
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError || (err instanceof Error && /fetch|network/i.test(err.message))
}
