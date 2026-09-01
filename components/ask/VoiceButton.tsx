"use client"

import { MicIcon, MicOffIcon } from "lucide-react"

export function VoiceButton({
  listening,
  onStart,
  onStop,
  level = 0,
}: {
  listening: boolean
  onStart: () => void
  onStop: () => void
  level?: number
}) {
  // 7 bars, height driven purely by real-time audio level (0..1)
  const bars = Array.from({ length: 7 }, (_, i) => {
    const centre = 3
    const distance = Math.abs(i - centre)
    const falloff = 1 - distance * 0.15
    const height = 6 + Math.max(0, level * 26 * falloff)
    return height
  })

  return (
    <div className="relative flex-shrink-0">
      {listening && (
        <div className="wave absolute -top-10 left-1/2 -translate-x-1/2" aria-hidden>
          {bars.map((h, i) => (
            <span key={i} style={{ height: `${h}px` }} />
          ))}
        </div>
      )}
      <button
        type="button"
        aria-label={listening ? "Stop listening" : "Speak your question"}
        aria-pressed={listening}
        onClick={listening ? onStop : onStart}
        className={
          "w-12 h-12 rounded-full flex items-center justify-center transition " +
          (listening
            ? "bg-[color:var(--red-500)] text-white shadow-lg"
            : "bg-[color:var(--green-700)] text-white hover:bg-[color:var(--green-800)]")
        }
      >
        {listening ? <MicOffIcon size={20} aria-hidden /> : <MicIcon size={20} aria-hidden />}
      </button>
    </div>
  )
}
