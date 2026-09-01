"use client"

import { ACCENTS } from "@/lib/dialect"
import { CheckIcon } from "lucide-react"

export function AccentPicker({
  value,
  onChange,
  name,
}: {
  value: string
  onChange: (id: string) => void
  name: string
}) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Choose an accent">
      {ACCENTS.map((a) => {
        const selected = value === a.id
        const preview = `${a.greeting}, ${name.trim() || "friend"}`
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className="choice"
            onClick={() => onChange(a.id)}
          >
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="font-semibold">{a.label}</span>
              <span className="text-sm text-[color:var(--muted)]">
                &ldquo;{preview}&rdquo; · {a.region}
              </span>
            </div>
            {selected && <CheckIcon size={20} className="text-[color:var(--green-700)] flex-shrink-0" aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}
