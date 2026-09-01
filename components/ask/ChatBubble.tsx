"use client"

import { useState } from "react"
import type { AskResponse } from "@/lib/api"
import { Volume2Icon, ChevronDownIcon, ChevronUpIcon, ShieldAlertIcon, HeartHandshakeIcon, InfoIcon, BookOpenIcon, LightbulbIcon } from "lucide-react"

const TOPIC_LABELS: Record<string, string> = {
  schemes: "Schemes & funding",
  market: "Selling & markets",
  soil: "Soil & inputs",
  livestock: "Livestock",
  weather: "Weather",
  tech: "Digital tools",
  wellbeing: "Wellbeing",
  connectivity: "Connectivity",
  records: "Records",
}

const TOPIC_STYLES: Record<string, string> = {
  schemes: "chip-green",
  market: "chip-amber",
  soil: "chip-green",
  livestock: "chip-amber",
  weather: "chip-blue",
  tech: "chip-blue",
  wellbeing: "chip-red",
  connectivity: "chip-blue",
  records: "chip-gray",
}

export function UserBubble({ text }: { text: string }) {
  return (
    <div className="bubble user">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  )
}

export function AnswerBubble({
  response,
  onSpeak,
  onFollowup,
}: {
  response: AskResponse
  onSpeak?: () => void
  onFollowup?: (q: string) => void
}) {
  const [showWhy, setShowWhy] = useState(false)
  const [showSources, setShowSources] = useState(false)

  if (response.is_crisis) {
    return (
      <div className="bubble crisis" role="alert" aria-label="Wellbeing support">
        <div className="flex items-center gap-2 font-semibold">
          <HeartHandshakeIcon size={18} aria-hidden />
          <span>Please talk to someone</span>
        </div>
        <p className="text-sm leading-relaxed">{response.answer}</p>
      </div>
    )
  }

  if (response.blocked) {
    return (
      <div className="bubble blocked" role="alert" aria-label="Regulated advice notice">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlertIcon size={18} aria-hidden />
          <span>This needs a licensed adviser</span>
        </div>
        <p className="text-sm leading-relaxed">{response.answer}</p>
      </div>
    )
  }

  const cls = response.abstained ? "bubble abstained" : "bubble"
  const topicLabel = TOPIC_LABELS[response.topic] || response.topic
  const topicStyle = TOPIC_STYLES[response.topic] || "chip-gray"
  const confStyle =
    response.confidence === "high" ? "chip-green" : response.confidence === "medium" ? "chip-amber" : "chip-gray"
  const confLabel = response.confidence[0].toUpperCase() + response.confidence.slice(1)

  return (
    <div className={cls} role={response.abstained ? "status" : undefined}>
      {response.abstained && (
        <div className="flex items-center gap-2 text-sm text-[color:var(--muted)] font-semibold">
          <InfoIcon size={14} aria-hidden />
          <span>Not sure — here&apos;s what to check</span>
        </div>
      )}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{response.answer}</p>

      <div className="flex flex-wrap gap-1.5">
        <span className={`chip ${topicStyle}`}>{topicLabel}</span>
        <span className={`chip ${confStyle}`}>Confidence: {confLabel}</span>
        {response.sources.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSources((v) => !v)}
            className="chip chip-outline flex items-center gap-1"
            aria-expanded={showSources}
            aria-label={`${response.sources.length} source${response.sources.length === 1 ? "" : "s"}: ${response.sources.join(", ")}`}
          >
            <BookOpenIcon size={12} aria-hidden />
            {response.sources.length} source{response.sources.length === 1 ? "" : "s"}
          </button>
        )}
      </div>

      {showSources && response.sources.length > 0 && (
        <ul className="text-xs text-[color:var(--fg)] flex flex-col gap-1 pl-1">
          {response.sources.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[color:var(--muted)]">·</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}

      {response.why && (
        <button
          type="button"
          className="text-xs text-[color:var(--muted)] hover:text-[color:var(--fg)] flex items-center gap-1 self-start"
          onClick={() => setShowWhy((v) => !v)}
          aria-expanded={showWhy}
        >
          {showWhy ? <ChevronUpIcon size={12} aria-hidden /> : <ChevronDownIcon size={12} aria-hidden />}
          Why this answer?
        </button>
      )}
      {showWhy && response.why && (
        <blockquote className="why-passage">{response.why}</blockquote>
      )}

      {response.followups.length > 0 && onFollowup && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-[color:var(--muted)] font-semibold">Follow up:</p>
          <div className="flex flex-wrap gap-1.5">
            {response.followups.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFollowup(f)}
                className="chip chip-outline hover:bg-[color:var(--amber-50)] hover:border-[color:var(--amber-400)] transition text-left"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {onSpeak && (
        <button
          type="button"
          onClick={onSpeak}
          className="btn-ghost self-start"
          aria-label="Read this answer aloud"
        >
          <Volume2Icon size={14} aria-hidden /> Read aloud
        </button>
      )}

      {response.tip && (
        <p className="text-xs italic text-[color:var(--muted)] pt-2 border-t border-[color:var(--border)] flex items-start gap-2">
          <LightbulbIcon size={14} className="mt-0.5 flex-shrink-0" aria-hidden />
          <span><span className="sr-only">Tip:</span>{response.tip}</span>
        </p>
      )}
    </div>
  )
}
