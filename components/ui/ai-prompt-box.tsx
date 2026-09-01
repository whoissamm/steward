"use client"

import { useRef, useState, type FormEvent } from "react"
import { SendIcon, MicIcon, MicOffIcon, SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function AiPromptBox({
  onSubmit,
  placeholder = "Ask about your farm…",
  disabled,
  suggestions,
  showVoice = true,
  onVoice,
  listening,
  className,
}: {
  onSubmit: (text: string) => void
  placeholder?: string
  disabled?: boolean
  suggestions?: string[]
  showVoice?: boolean
  onVoice?: () => void
  listening?: boolean
  className?: string
}) {
  const [text, setText] = useState("")
  const taRef = useRef<HTMLTextAreaElement>(null)

  function submit(e?: FormEvent) {
    e?.preventDefault()
    const t = text.trim()
    if (!t || disabled) return
    onSubmit(t)
    setText("")
    if (taRef.current) taRef.current.style.height = "auto"
  }

  function autoresize() {
    const el = taRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {suggestions && suggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSubmit(s)}
              disabled={disabled}
              className="chip chip-outline hover:bg-[color:var(--amber-50)] hover:border-[color:var(--amber-400)] flex-shrink-0 flex items-center gap-1.5"
            >
              <SparklesIcon size={11} aria-hidden />
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={submit}
        className="relative flex items-end gap-2 p-2 rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface)] focus-within:border-[color:var(--green-600)] focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.15)] transition"
      >
        {showVoice && (
          <button
            type="button"
            onClick={onVoice}
            aria-label={listening ? "Stop listening" : "Speak your question"}
            aria-pressed={listening}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
              listening
                ? "bg-[color:var(--red-500)] text-white"
                : "bg-[color:var(--surface-alt)] text-[color:var(--fg)] hover:bg-[color:var(--amber-100)]",
            )}
          >
            {listening ? <MicOffIcon size={18} aria-hidden /> : <MicIcon size={18} aria-hidden />}
          </button>
        )}
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value)
            autoresize()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          className="flex-1 min-h-[44px] max-h-40 resize-none bg-transparent px-2 py-2.5 text-[color:var(--fg)] focus:outline-none placeholder:text-[color:var(--muted)] text-[15px] leading-snug"
          aria-label="Type your question"
          enterKeyHint="send"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="w-11 h-11 rounded-xl bg-[color:var(--green-700)] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[color:var(--green-800)] transition-colors"
          aria-label="Send"
        >
          <SendIcon size={18} aria-hidden />
        </button>
      </form>
    </div>
  )
}
