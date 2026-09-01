"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { api, type AskResponse } from "@/lib/api"
import { useProfile } from "@/hooks/useProfile"
import { useAudio } from "@/hooks/useAudio"
import { AnswerBubble, UserBubble } from "@/components/ask/ChatBubble"
import { TypingIndicator } from "@/components/ask/TypingIndicator"
import { VoiceButton } from "@/components/ask/VoiceButton"
import { SendIcon, XIcon } from "lucide-react"

type Turn = { id: string; question: string; response?: AskResponse; error?: string }

const SEED_SUGGESTIONS = [
  "Do I need to irrigate today?",
  "Can I still apply for the SFI scheme?",
  "How do I improve my soil health?",
  "How does rotational grazing help?",
  "Is there a frost risk tonight?",
]

function AskInner() {
  const params = useSearchParams()
  const { profile, update } = useProfile()
  const { listening, listen, stop, speak, error: voiceError, clearError, audioLevel } = useAudio(profile.accent, profile.read_aloud)
  const [turns, setTurns] = useState<Turn[]>([])
  const [text, setText] = useState("")
  const [pending, setPending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const seededRef = useRef(false)
  const idRef = useRef(0)
  const nextId = () => `t${++idRef.current}`

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed || pending) return
      const id = nextId()
      setTurns((t) => [...t, { id, question: trimmed }])
      setText("")
      setPending(true)
      try {
        const response = await api.ask(trimmed, profile)
        setTurns((t) => t.map((x) => (x.id === id ? { ...x, response } : x)))
        // Merge server-authoritative badges & points into local profile
        update({
          points: response.total_points,
          turns: profile.turns + 1,
          badges: Array.from(new Set([...profile.badges, ...response.new_badges])),
        })
        if (response.new_badges.length > 0) {
          setToast(`New badge earned: ${response.new_badges.join(", ")}`)
          setTimeout(() => setToast(null), 3500)
        }
        // Only auto-read normal (non-crisis, non-blocked) answers
        if (profile.read_aloud && !response.is_crisis && !response.blocked) {
          speak(response.answer)
        }
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
    [pending, profile, speak, update],
  )

  useEffect(() => {
    if (seededRef.current) return
    const q = params.get("q")
    if (q) {
      seededRef.current = true
      ask(q)
    }
  }, [params, ask])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [turns, pending])

  const latestTurnId = turns[turns.length - 1]?.id

  return (
    <main className="screen" style={{ paddingBottom: 180 }}>
      <header className="flex items-center justify-between">
        <div>
          <p className="sec">Ask Steward</p>
          <h1 className="text-xl font-bold">
            {turns.length === 0 ? "What’s on your mind?" : "Chat"}
          </h1>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={profile.read_aloud}
          aria-label={`Read aloud: ${profile.read_aloud ? "on" : "off"}`}
          onClick={() => update({ read_aloud: !profile.read_aloud })}
          className="flex items-center gap-2 text-xs"
        >
          <span className="text-[color:var(--muted)]">Read aloud</span>
          <span className="toggle" aria-checked={profile.read_aloud} role="presentation" />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 flex flex-col gap-3 overflow-y-auto"
      >
        {turns.length === 0 && (
          <section className="card flex flex-col gap-3">
            <p className="text-sm text-[color:var(--muted)]">
              Steward answers using GOV.UK, AHDB and Met Office sources. It abstains when unsure and points you to a person for regulated decisions (vet, agronomist).
            </p>
            <div className="flex flex-wrap gap-2">
              {SEED_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="chip chip-outline hover:bg-[color:var(--amber-50)] hover:border-[color:var(--amber-400)] transition px-3 py-2 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}
        {turns.map((t) => {
          const isLatest = t.id === latestTurnId
          return (
            <div
              key={t.id}
              className="flex flex-col gap-2"
              aria-live={isLatest ? "polite" : undefined}
              aria-atomic={isLatest ? true : undefined}
            >
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
                <AnswerBubble
                  response={t.response}
                  onSpeak={() => speak(t.response!.answer)}
                  onFollowup={(q) => ask(q)}
                />
              )}
            </div>
          )
        })}
        {pending && <TypingIndicator />}
      </div>

      {voiceError && (
        <div className="fixed left-1/2 bottom-[164px] -translate-x-1/2 max-w-[calc(100vw-32px)] flex items-center gap-2 bg-[color:var(--surface)] border border-[color:var(--red-500)] rounded-xl px-3 py-2 text-sm shadow-lg z-40" role="alert">
          <span>{voiceError}</span>
          <button
            type="button"
            aria-label="Dismiss voice error"
            className="btn-ghost p-1"
            onClick={clearError}
          >
            <XIcon size={14} aria-hidden />
          </button>
        </div>
      )}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          ask(text)
        }}
      >
        <div className="composer-inner">
          <VoiceButton
            listening={listening}
            onStart={() =>
              listen((t) => {
                setText(t)
                api.progress("voice_used", undefined, profile).catch(() => {})
              })
            }
            onStop={stop}
            level={audioLevel}
          />
          <label htmlFor="ask-input" className="sr-only">Ask Steward a question</label>
          <input
            id="ask-input"
            className="input flex-1"
            placeholder="Ask a question about your farm…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={pending}
            autoComplete="off"
            enterKeyHint="send"
          />
          <button
            type="submit"
            className="btn-primary flex-shrink-0"
            disabled={pending || !text.trim()}
            aria-label="Send question"
          >
            <SendIcon size={18} aria-hidden />
          </button>
        </div>
      </form>

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}

export default function AskPage() {
  return (
    <Suspense fallback={<main className="screen"><p className="text-sm text-[color:var(--muted)]">Loading…</p></main>}>
      <AskInner />
    </Suspense>
  )
}
