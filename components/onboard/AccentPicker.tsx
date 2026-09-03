"use client"

import { useRef, useState } from "react"
import { ACCENTS } from "@/lib/dialect"
import { CheckIcon, PlayIcon, Loader2Icon, PauseIcon } from "lucide-react"

/**
 * Accent picker with a per-row "Hear this accent" button. Fetches
 * /api/tts with a distinctive multi-word phrase written in that accent's
 * vocabulary — ElevenLabs speaks it with the mapped British voice so the
 * farmer can hear the difference before committing.
 */
export function AccentPicker({
  value,
  onChange,
  name,
  voiceGender,
}: {
  value: string
  onChange: (id: string) => void
  name: string
  voiceGender?: "male" | "female"
}) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)

  function stopCurrent() {
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.src = ""
      } catch {
        // ignore
      }
      audioRef.current = null
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setPlayingId(null)
  }

  async function playAccent(accentId: string, phrase: string) {
    // Toggle behaviour: tapping the play button of the currently-playing accent stops it.
    if (playingId === accentId) {
      stopCurrent()
      return
    }
    stopCurrent()
    setLoadingId(accentId)
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: phrase, accent: accentId, gender: voiceGender ?? "male" }),
      })
      const ctype = res.headers.get("content-type") || ""
      if (res.ok && ctype.includes("audio/")) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        urlRef.current = url
        const audio = new Audio(url)
        audioRef.current = audio
        setPlayingId(accentId)
        audio.onended = () => stopCurrent()
        audio.onerror = () => stopCurrent()
        await audio.play()
      } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
        // ElevenLabs missing → browser fallback so the preview still works
        const data = (await res.json().catch(() => null)) as { dialect_text?: string } | null
        const utter = new SpeechSynthesisUtterance(data?.dialect_text || phrase)
        utter.lang = "en-GB"
        setPlayingId(accentId)
        utter.onend = () => setPlayingId(null)
        utter.onerror = () => setPlayingId(null)
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utter)
      }
    } catch {
      stopCurrent()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Choose an accent">
      {ACCENTS.map((a) => {
        const selected = value === a.id
        const preview = `${a.greeting}, ${name.trim() || "friend"}`
        const isPlaying = playingId === a.id
        const isLoading = loadingId === a.id
        return (
          <div
            key={a.id}
            className="choice cursor-default"
            aria-checked={selected}
            role="radio"
          >
            <button
              type="button"
              onClick={() => onChange(a.id)}
              className="flex-1 flex flex-col gap-1 min-w-0 text-left"
              aria-label={`Choose ${a.label} accent`}
            >
              <span className="font-semibold">{a.label}</span>
              <span className="text-sm text-[color:var(--muted)]">
                &ldquo;{preview}&rdquo; · {a.region}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                playAccent(a.id, a.previewPhrase)
              }}
              aria-label={isPlaying ? `Stop preview of ${a.label}` : `Hear ${a.label} accent`}
              className={
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-colors " +
                (isPlaying
                  ? "bg-[color:var(--red-500)] text-white border-transparent"
                  : "bg-[color:var(--surface)] text-[color:var(--fg)] border-[color:var(--border)] hover:bg-[color:var(--amber-100)]")
              }
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2Icon size={16} className="animate-spin" aria-hidden />
              ) : isPlaying ? (
                <PauseIcon size={16} aria-hidden />
              ) : (
                <PlayIcon size={16} aria-hidden />
              )}
            </button>
            {selected && (
              <CheckIcon
                size={20}
                className="text-[color:var(--green-700)] flex-shrink-0"
                aria-hidden
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
