"use client"

import { motion } from "framer-motion"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type TodoCategory = "weather" | "livestock" | "soil" | "grants" | "records" | "general"

const CAT_LABEL: Record<TodoCategory, string> = {
  weather: "Weather",
  livestock: "Livestock",
  soil: "Soil",
  grants: "Grants",
  records: "Records",
  general: "Farm",
}

const CAT_STYLE: Record<TodoCategory, string> = {
  weather: "chip-blue",
  livestock: "chip-amber",
  soil: "chip-green",
  grants: "chip-blue",
  records: "chip-gray",
  general: "chip-outline",
}

export function TodoItem({
  id,
  label,
  done,
  category = "general",
  points = 5,
  onToggle,
  meta,
}: {
  id: string
  label: string
  done: boolean
  category?: TodoCategory
  points?: number
  onToggle: (id: string, next: boolean) => void
  meta?: string
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]"
    >
      <button
        type="button"
        onClick={() => onToggle(id, !done)}
        aria-pressed={done}
        aria-label={done ? `Undo: ${label}` : `Mark done: ${label}`}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition mt-0.5",
          done
            ? "bg-[color:var(--green-700)] border-[color:var(--green-700)] text-white"
            : "border-[color:var(--stone-400)] hover:border-[color:var(--green-600)]",
        )}
      >
        {done && <CheckIcon size={14} aria-hidden />}
      </button>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span
          className={cn(
            "text-sm leading-snug",
            done ? "line-through text-[color:var(--muted)]" : "text-[color:var(--fg)]",
          )}
        >
          {label}
        </span>
        {meta && <span className="text-xs text-[color:var(--muted)]">{meta}</span>}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={cn("chip", CAT_STYLE[category])}>{CAT_LABEL[category]}</span>
        {done ? (
          <span className="chip chip-amber">+{points}</span>
        ) : (
          <span className="chip chip-outline">+{points}</span>
        )}
      </div>
    </motion.li>
  )
}
