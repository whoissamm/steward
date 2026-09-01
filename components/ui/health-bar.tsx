"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const TONE_BG: Record<"green" | "amber" | "red", string> = {
  green: "var(--green-600)",
  amber: "var(--amber-400)",
  red: "var(--red-500)",
}

export function HealthBar({
  label,
  value,
  max = 100,
  tone,
  segments = 20,
  className,
}: {
  label: string
  value: number
  max?: number
  tone?: "green" | "amber" | "red"
  segments?: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(1, value / max))
  const filled = Math.round(pct * segments)
  const auto: "green" | "amber" | "red" = pct > 0.66 ? "green" : pct > 0.33 ? "amber" : "red"
  const t = tone ?? auto
  const color = TONE_BG[t]

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
          {label}
        </span>
        <span className="text-sm font-mono font-bold tabular-nums">
          {Math.round(value)}
          <span className="text-[color:var(--muted)]"> / {max}</span>
        </span>
      </div>
      <div
        className="flex gap-[2px] p-[3px] rounded-md bg-[color:var(--stone-900)]"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: i < filled ? 1 : 0.15, scaleY: 1 }}
            transition={{ delay: i * 0.02, duration: 0.2 }}
            className="flex-1 h-3 rounded-[2px]"
            style={{ background: i < filled ? color : "var(--stone-700)" }}
          />
        ))}
      </div>
    </div>
  )
}
