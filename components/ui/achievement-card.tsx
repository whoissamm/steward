"use client"

import { CheckIcon, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function AchievementCard({
  name,
  description,
  icon: Icon,
  earned,
  progress,
  target,
  unit,
  earnedAt,
}: {
  name: string
  description: string
  icon: LucideIcon
  earned: boolean
  progress?: number
  target?: number
  unit?: string
  earnedAt?: string
}) {
  const pct = target ? Math.min(100, Math.round(((progress ?? 0) / target) * 100)) : 0
  return (
    <div
      className={cn(
        "card flex items-start gap-3 relative overflow-hidden transition-all",
        earned && "border-[color:var(--amber-400)]",
      )}
      style={
        earned
          ? {
              boxShadow:
                "0 0 0 1px var(--amber-400), 0 6px 20px color-mix(in oklab, var(--amber-400) 30%, transparent)",
            }
          : undefined
      }
    >
      <div
        className={cn(
          "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative",
          earned
            ? "bg-[color:var(--amber-100)] text-[color:var(--amber-700)]"
            : "bg-[color:var(--surface-alt)] text-[color:var(--muted)] grayscale opacity-70",
        )}
      >
        <Icon size={26} aria-hidden />
        {earned && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[color:var(--green-700)] text-white flex items-center justify-center">
            <CheckIcon size={12} aria-hidden />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-semibold", earned ? "text-[color:var(--fg)]" : "text-[color:var(--muted)]")}>
            {name}
          </h3>
          {earned && earnedAt && (
            <span className="text-[10px] text-[color:var(--muted)]">Earned {earnedAt}</span>
          )}
        </div>
        <p className="text-sm text-[color:var(--muted)] leading-snug">{description}</p>
        {!earned && target && progress !== undefined && (
          <div className="flex flex-col gap-1 mt-1">
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-[color:var(--muted)] tabular-nums">
              {progress}/{target}{unit ? ` ${unit}` : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
