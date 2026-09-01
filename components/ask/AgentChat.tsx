"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api, type AskResponse } from "@/lib/api"
import { useProfile } from "@/hooks/useProfile"
import { useAudio } from "@/hooks/useAudio"
import { behaviourSummary } from "@/lib/profile"
import { AnswerBubble, UserBubble } from "@/components/ask/ChatBubble"
import { TypingIndicator } from "@/components/ask/TypingIndicator"
import { AiPromptBox } from "@/components/ui/ai-prompt-box"
import { AchievementUnlocked } from "@/components/ui/achievement-unlocked"
import { BADGES } from "@/lib/gamification"
import { AwardIcon, XIcon } from "lucide-react"

export type AgentChatProps = {
  agentId: string
  agentName: string
  agentColor: string
  greeting: string
  suggestions: string[]
  initialQuestion?: string
}

type Turn = { id: string; question: string; response?: AskResponse; error?: string }

export function AgentChat({ agentId, agentName, agentColor, greeting, suggestions, initialQuestion }: AgentChatProps) {
  const { profile, update, logActivity, markCompletion } = useProfile()
  const { listening, listen, stop, speak, error: voiceError, clearError, audioLevel } = useAudio(
    profile.accent,
    profile.read_aloud,
  )
  const [turns, setTurns] = useState<Turn[]>([])
  const [pending, setPending] = useState(false)
  const [unlocked, setUnlocked] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const seededRef = useRef(false)
  const idRef = useRef(0)
  const nextId = () => `t${++idRef.current}`
  void audioLevel

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed || pending) return
      const id = nextId()
      setTurns((t) => [...t, { id, question: trimmed }])
      setPending(true)
      logActivity(`ask:${agentId}`, { question: trimmed })
      markCompletion()
      try {
        const summary = behaviourSummary(profile)
        const response = await api.ask(trimmed, {
          ...profile,
          points: profile.points,
          turns: profile.turns,
          badges: profile.badges,
          has_sensors: profile.has_sensors,
        }, { agentId, behaviourSummary: summary })
        setTurns((t) => t.map((x) => (x.id === id ? { ...x, response } : x)))
        update({
          points: response.total_points,
          turns: profile.turns + 1,
          badges: Array.from(new Set([...profile.badges, ...response.new_badges])),
          agent_preference: agentId,
        })
        if (response.new_badges.length > 0) {
          setUnlocked(response.new_badges[0])
        }
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
    [pending, profile, speak, update, logActivity, markCompletion, agentId],
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
        className="flex-1 flex flex-col gap-3 overflow-y-auto pb-32"
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
              Answers are grounded in GOV.UK, AHDB and Met Office sources. Regulated advice
              (vet dosing, spray rates) is redirected to a licensed professional.
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
        className="fixed left-0 right-0 bottom-24 px-3 z-40"
        style={{ paddingBottom: 0 }}
      >
        <div className="mx-auto max-w-3xl">
          <AiPromptBox
            onSubmit={ask}
            placeholder={`Ask ${agentName}…`}
            disabled={pending}
            suggestions={turns.length === 0 ? suggestions : undefined}
            listening={listening}
            onVoice={() => {
              if (listening) stop()
              else
                listen((text) => {
                  ask(text)
                  api.progress("voice_used", undefined, profile).catch(() => {})
                })
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
