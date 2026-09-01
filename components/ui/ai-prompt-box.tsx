"use client"

import { useRef, useState, type FormEvent } from "react"
import { SendIcon, MicIcon, MicOffIcon, SparklesIcon, PaperclipIcon, XIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB

export function AiPromptBox({
  onSubmit,
  placeholder = "Ask about your farm…",
  disabled,
  suggestions,
  showVoice = true,
  showAttach = true,
  onVoice,
  listening,
  className,
}: {
  onSubmit: (text: string, image?: File) => void
  placeholder?: string
  disabled?: boolean
  suggestions?: string[]
  showVoice?: boolean
  showAttach?: boolean
  onVoice?: () => void
  listening?: boolean
  className?: string
}) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function submit(e?: FormEvent) {
    e?.preventDefault()
    const t = text.trim()
    if ((!t && !image) || disabled) return
    onSubmit(t, image?.file)
    setText("")
    setImage(null)
    if (taRef.current) taRef.current.style.height = "auto"
  }

  function autoresize() {
    const el = taRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }

  function handleFile(file: File | null) {
    setAttachError(null)
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setAttachError("Only images are supported right now.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setAttachError("Image is too large — max 4 MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImage({ file, preview: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {suggestions && suggestions.length > 0 && !image && (
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
      {image && (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[color:var(--border)] self-start">
          <img src={image.preview} alt="Attached preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setImage(null)}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
            aria-label="Remove attached image"
          >
            <XIcon size={12} aria-hidden />
          </button>
        </div>
      )}
      {attachError && (
        <p className="text-xs text-[color:var(--red-600)]" role="alert">{attachError}</p>
      )}
      <form
        onSubmit={submit}
        className="relative flex items-end gap-2 p-2 rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur-md focus-within:border-[color:var(--green-600)] focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.15)] transition"
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
        {showAttach && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Attach a photo"
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-[color:var(--surface-alt)] text-[color:var(--fg)] hover:bg-[color:var(--amber-100)] transition-colors"
            >
              {image ? <ImageIcon size={18} aria-hidden /> : <PaperclipIcon size={18} aria-hidden />}
            </button>
          </>
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
          disabled={disabled || (!text.trim() && !image)}
          className="w-11 h-11 rounded-xl bg-[color:var(--green-700)] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[color:var(--green-800)] transition-colors"
          aria-label="Send"
        >
          <SendIcon size={18} aria-hidden />
        </button>
      </form>
    </div>
  )
}
