"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api, type AskResponse, type AgentAction } from "@/lib/api"
import { useProfile } from "@/hooks/useProfile"
import { useAudio } from "@/hooks/useAudio"
import { behaviourSummary, profileContextSummary, type CalendarEvent, type TodoItem } from "@/lib/profile"
import { detectClientIntent } from "@/lib/intents"
import { AnswerBubble, UserBubble } from "@/components/ask/ChatBubble"
import { TypingIndicator } from "@/components/ask/TypingIndicator"
import { AiPromptBox } from "@/components/ui/ai-prompt-box"
import { AchievementUnlocked } from "@/components/ui/achievement-unlocked"
import { BADGES } from "@/lib/gamification"
import { AwardIcon, CalendarPlusIcon, CheckCircle2Icon, ListPlusIcon, StickyNoteIcon, XIcon } from "lucide-react"

export type AgentChatProps = {
  agentId: string
  agentName: string
  agentColor: string
  greeting: string
  suggestions: string[]
  initialQuestion?: string
}

type Turn = {
  id: string
  question: string
  imagePreview?: string
  response?: AskResponse
  error?: string
  appliedActions?: AgentAction[]
}

async function fileToBase64(file: File): Promise<{ data: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [meta, data] = result.split(",")
      const mimeMatch = meta.match(/data:([^;]+)/)
      resolve({ data, mime: mimeMatch?.[1] || file.type || "image/jpeg" })
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function AgentChat({ agentId, agentName, agentColor, greeting, suggestions, initialQuestion }: AgentChatProps) {
  const { profile, update, logActivity, markCompletion } = useProfile()
  const { listening, listen, stop, speak, stopSpeaking, error: voiceError, clearError, audioLevel } = useAudio(
    profile.accent,
    profile.read_aloud,
    profile.voice_gender ?? "male",
  )
  const [turns, setTurns] = useState<Turn[]>([])
  const [pending, setPending] = useState(false)
  const [unlocked, setUnlocked] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const seededRef = useRef(false)
  const idRef = useRef(0)
  const nextId = () => `t${++idRef.current}`
  const hydratedRef = useRef(false)
  void audioLevel

  // Hydrate turns from persisted per-agent chat history (once per mount).
  // This is what stops the "chat vanishes when I leave the page" behaviour.
  useEffect(() => {
    if (hydratedRef.current) return
    if (!profile.remember_chat) return
    const history = profile.chat_history?.[agentId] ?? []
    if (history.length === 0) return
    // Pair user/assistant into Turn structures
    const restored: Turn[] = []
    for (let i = 0; i < history.length; i++) {
      const h = history[i]
      if (h.role === "user") {
        restored.push({ id: `h${i}`, question: h.text })
      } else if (h.role === "assistant" && restored.length > 0) {
        const last = restored[restored.length - 1]
        // Synthesize a minimal response shell — enough to render the bubble
        last.response = {
          answer: h.text,
          sources: [],
          confidence: "medium",
          topic: "",
          why: "",
          abstained: false,
          blocked: false,
          is_crisis: false,
          followups: [],
          tip: null,
          new_badges: [],
          points_earned: 0,
          total_points: profile.points,
          level: "",
        }
      }
    }
    if (restored.length > 0) setTurns(restored)
    idRef.current = restored.length + 10
    hydratedRef.current = true
  }, [agentId, profile.chat_history, profile.remember_chat, profile.points])

  // Persist chat history whenever `turns` changes (if the user opted in)
  useEffect(() => {
    if (!hydratedRef.current) return
    if (!profile.remember_chat) return
    const flat: { role: "user" | "assistant"; text: string; at: string }[] = []
    for (const t of turns) {
      flat.push({ role: "user", text: t.question, at: new Date().toISOString() })
      if (t.response) {
        flat.push({ role: "assistant", text: t.response.answer, at: new Date().toISOString() })
      }
    }
    // Keep only the last 30 turns (60 messages) per agent
    const capped = flat.slice(-60)
    const nextHistory = { ...(profile.chat_history ?? {}), [agentId]: capped }
    // Only persist if content changed (cheap length + last-text check)
    const prev = profile.chat_history?.[agentId] ?? []
    if (prev.length !== capped.length || (capped.length > 0 && prev[prev.length - 1]?.text !== capped[capped.length - 1]?.text)) {
      update({ chat_history: nextHistory })
    }
  }, [turns, agentId, profile.remember_chat, profile.chat_history, update])

  const applyActions = useCallback(
    (actions: AgentAction[]): AgentAction[] => {
      if (!actions || actions.length === 0) return []
      const applied: AgentAction[] = []
      const nextEvents: CalendarEvent[] = [...profile.events]
      const nextTodos: TodoItem[] = [...(profile.todos ?? [])]
      let nextCompletedDates = profile.completed_dates
      let eventsChanged = false
      let todosChanged = false

      for (const a of actions) {
        if (a.kind === "add_event") {
          nextEvents.push({
            id: `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            date: a.date,
            title: a.title,
            kind: a.category ?? "todo",
          })
          eventsChanged = true
          applied.push(a)
        } else if (a.kind === "add_todo") {
          nextTodos.push({
            id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            text: a.text,
            category: a.category,
            done: false,
            created_at: new Date().toISOString(),
            source: "chat",
          })
          todosChanged = true
          applied.push(a)
        } else if (a.kind === "log_note") {
          logActivity(`note`, { text: a.text })
          applied.push(a)
        } else if (a.kind === "mark_todo_done") {
          // Match by text (loose contains) or id — mark the first open todo
          const idx = nextTodos.findIndex(
            (t) =>
              !t.done &&
              (t.id === a.id_or_text || t.text.toLowerCase().includes(a.id_or_text.toLowerCase())),
          )
          if (idx >= 0) {
            nextTodos[idx] = { ...nextTodos[idx], done: true }
            todosChanged = true
          }
          const iso = new Date().toISOString().slice(0, 10)
          if (!nextCompletedDates.includes(iso)) nextCompletedDates = [...nextCompletedDates, iso].sort()
          applied.push(a)
        }
      }

      const patch: Partial<typeof profile> = {}
      if (eventsChanged) patch.events = nextEvents
      if (todosChanged) patch.todos = nextTodos
      if (nextCompletedDates !== profile.completed_dates) patch.completed_dates = nextCompletedDates
      if (Object.keys(patch).length > 0) update(patch)
      return applied
    },
    [profile, update, logActivity],
  )

  const ask = useCallback(
    async (question: string, image?: File) => {
      const trimmed = question.trim()
      if ((!trimmed && !image) || pending) return
      const id = nextId()
      let imagePayload: { data: string; mime: string } | null = null
      let imagePreview: string | undefined
      if (image) {
        try {
          imagePayload = await fileToBase64(image)
          imagePreview = `data:${imagePayload.mime};base64,${imagePayload.data}`
        } catch {
          // ignore preview failure
        }
      }
      const summary = behaviourSummary(profile)
      const context = profileContextSummary(profile)
      setTurns((t) => [...t, { id, question: trimmed || "(image only)", imagePreview }])
      setPending(true)
      logActivity(`ask:${agentId}`, { question: trimmed })
      markCompletion()
      try {
        const response = await api.ask(
          trimmed || "See the attached photo and advise.",
          {
            id: profile.id,
            name: profile.name,
            accent: profile.accent,
            farm_type: profile.farm_type,
            has_sensors: profile.has_sensors,
            read_aloud: profile.read_aloud,
            dark_mode: profile.dark_mode,
            large_text: profile.large_text,
            points: profile.points,
            turns: profile.turns,
            streak: profile.streak,
            badges: profile.badges,
            lesson_done: profile.lesson_done,
            quiz_done: profile.quiz_done,
          },
          {
            agentId,
            behaviourSummary: summary,
            profileContext: context,
            voiceGender: profile.voice_gender ?? "male",
            imageBase64: imagePayload?.data,
            imageMime: imagePayload?.mime,
            // Prior turns from THIS session's UI state — gives Gemini
            // conversational continuity within the current chat.
            history: turns.flatMap((t) => {
              const arr: { role: "user" | "assistant"; text: string }[] = []
              arr.push({ role: "user", text: t.question })
              if (t.response) arr.push({ role: "assistant", text: t.response.answer })
              return arr
            }),
          },
        )
        // Server actions come first; if empty, try to salvage intent from the
        // user's message (Gemini often agrees to do a thing but forgets to
        // emit the <actions> tag).
        const serverActions = response.actions ?? []
        const fallbackActions = serverActions.length === 0 ? detectClientIntent(trimmed) : []
        const applied = applyActions([...serverActions, ...fallbackActions])
        setTurns((t) => t.map((x) => (x.id === id ? { ...x, response, appliedActions: applied } : x)))
        update({
          points: response.total_points,
          turns: profile.turns + 1,
          badges: Array.from(new Set([...profile.badges, ...response.new_badges])),
          agent_preference: agentId,
        })
        if (response.new_badges.length > 0) setUnlocked(response.new_badges[0])
        // Skip auto-TTS on action-only responses (chip conveys the detail;
        // no one wants "I have added the dog vet appointment to your calendar
        // for today, 2 September 2026" read aloud on every task).
        const shouldSpeak =
          profile.read_aloud &&
          !response.is_crisis &&
          !response.blocked &&
          applied.length === 0
        if (shouldSpeak) speak(response.answer)
      } catch (e) {
        setTurns((t) =>
          t.map((x) =>
            x.id === id
              ? { ...x, error: `Could not reach Steward: ${(e as Error).message}` }
              : x,
          ),
        )
      } finally {
        setPending(false)
      }
    },
    [pending, profile, speak, update, logActivity, markCompletion, agentId, applyActions],
  )

  useEffect(() => {
    if (seededRef.current || !initialQuestion) return
    seededRef.current = true
    ask(initialQuestion)
  }, [initialQuestion, ask])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [turns, pending])

  const latestId = turns[turns.length - 1]?.id
  const badgeMeta = unlocked ? BADGES[unlocked] : null

  return (
    <>
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col gap-3 overflow-y-auto pb-40"
      >
        {turns.length === 0 && (
          <section className="card flex flex-col gap-3" style={{ borderColor: agentColor }}>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: agentColor }}
                aria-hidden
              />
              <p className="text-sm font-semibold">{agentName}</p>
            </div>
            <p className="text-[color:var(--muted)] text-sm leading-relaxed">{greeting}</p>
            <p className="text-xs text-[color:var(--muted)] italic">
              I can also read your calendar, add tasks, and remember what we&apos;ve done together.
              Try: &ldquo;What&apos;s on today?&rdquo; or &ldquo;Add a soil test to next Monday&rdquo;.
            </p>
          </section>
        )}
        {turns.map((t) => {
          const isLatest = t.id === latestId
          return (
            <div
              key={t.id}
              className="flex flex-col gap-2"
              aria-live={isLatest ? "polite" : undefined}
              aria-atomic={isLatest ? true : undefined}
            >
              {t.imagePreview && (
                <div className="self-end max-w-[70%] rounded-2xl overflow-hidden border border-[color:var(--border)]">
                  <img src={t.imagePreview} alt="Attached" className="w-full h-auto" />
                </div>
              )}
              <UserBubble text={t.question} />
              {t.error && (
                <div className="bubble crisis" role="alert">
                  <p className="text-sm">{t.error}</p>
                  <button
                    type="button"
                    className="btn-secondary self-start text-xs"
                    onClick={() => ask(t.question)}
                  >
                    Try again
                  </button>
                </div>
              )}
              {t.response && (
                <>
                  <AnswerBubble
                    response={t.response}
                    onSpeak={() => speak(t.response!.answer)}
                    onFollowup={(q) => ask(q)}
                  />
                  {t.appliedActions && t.appliedActions.length > 0 && (
                    <div className="flex flex-col gap-1.5 ml-3">
                      {t.appliedActions.map((a, i) => (
                        <AppliedActionRow key={i} action={a} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
        {pending && <TypingIndicator />}
      </div>

      {voiceError && (
        <div
          className="fixed left-1/2 bottom-40 -translate-x-1/2 max-w-[calc(100vw-32px)] flex items-center gap-2 bg-[color:var(--surface)] border border-[color:var(--red-500)] rounded-xl px-3 py-2 text-sm shadow-lg z-40"
          role="alert"
        >
          <span>{voiceError}</span>
          <button
            type="button"
            aria-label="Dismiss voice error"
            className="btn-ghost !p-1"
            onClick={clearError}
          >
            <XIcon size={14} aria-hidden />
          </button>
        </div>
      )}

      <div
        className="fixed left-0 right-0 z-30 pointer-events-none px-3"
        style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)` }}
      >
        <div className="mx-auto max-w-3xl pointer-events-auto">
          <AiPromptBox
            onSubmit={(text, file) => ask(text, file)}
            placeholder={`Ask ${agentName}…`}
            disabled={pending}
            suggestions={turns.length === 0 ? suggestions : undefined}
            listening={listening}
            onVoice={() => {
              if (listening) stop()
              else {
                stopSpeaking()
                listen((text) => {
                  ask(text)
                  api.progress("voice_used", undefined, profile).catch(() => {})
                })
              }
            }}
          />
        </div>
      </div>

      {badgeMeta && (
        <AchievementUnlocked
          open
          onClose={() => setUnlocked(null)}
          name={badgeMeta.name}
          description={badgeMeta.description}
          icon={AwardIcon}
        />
      )}
    </>
  )
}

function AppliedActionRow({ action }: { action: AgentAction }) {
  let Icon = CheckCircle2Icon
  let label = ""
  if (action.kind === "add_event") {
    Icon = CalendarPlusIcon
    const friendlyDate = new Date(action.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    label = `Added to calendar: ${action.title} · ${friendlyDate}`
  } else if (action.kind === "add_todo") {
    Icon = ListPlusIcon
    label = `Added to your to-do list: ${action.text}`
  } else if (action.kind === "mark_todo_done") {
    Icon = CheckCircle2Icon
    label = `Marked done: ${action.id_or_text}`
  } else if (action.kind === "log_note") {
    Icon = StickyNoteIcon
    label = `Noted: ${action.text}`
  }
  return (
    <span className="chip chip-green flex items-center gap-1 self-start">
      <Icon size={12} aria-hidden /> {label}
    </span>
  )
}
