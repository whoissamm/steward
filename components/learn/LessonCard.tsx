"use client"

import { useState } from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

export function LessonCard({
  id,
  title,
  body,
  done,
  onComplete,
}: {
  id: string
  title: string
  body: string
  done: boolean
  onComplete: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <article className="card flex flex-col gap-3">
      <button
        type="button"
        className="flex items-center justify-between text-left w-full"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`lesson-${id}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {done && (
            <span className="w-6 h-6 rounded-full bg-[color:var(--green-700)] text-white flex items-center justify-center flex-shrink-0">
              <CheckIcon size={14} aria-hidden />
            </span>
          )}
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        {open ? <ChevronUpIcon size={18} aria-hidden /> : <ChevronDownIcon size={18} aria-hidden />}
      </button>
      {open && (
        <div id={`lesson-${id}`} className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-[color:var(--stone-700)] dark:text-[color:var(--muted)]">
            {body}
          </p>
          {!done && (
            <button type="button" className="btn-primary self-start" onClick={onComplete}>
              Got it! +5
            </button>
          )}
        </div>
      )}
    </article>
  )
}
