"use client"

import { TrendingDownIcon, TrendingUpIcon, MinusIcon, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatWidget({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  deltaLabel,
  tone,
  className,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  unit?: string
  delta?: number
  deltaLabel?: string
  tone?: "green" | "amber" | "red" | "neutral"
  className?: string
  onClick?: () => void
}) {
  const t = tone ?? "neutral"
  const iconColor = {
    green: "text-[color:var(--green-700)] bg-[color:color-mix(in_oklab,var(--green-500)_15%,var(--surface))]",
    amber: "text-[color:var(--amber-700)] bg-[color:var(--amber-100)]",
    red: "text-[color:var(--red-600)] bg-[color:color-mix(in_oklab,var(--red-500)_12%,var(--surface))]",
    neutral: "text-[color:var(--muted)] bg-[color:var(--surface-alt)]",
  }[t]

  const El = onClick ? "button" : "div"
  return (
    <El
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "card flex flex-col gap-3 text-left transition-transform",
        onClick && "hover:scale-[1.01] cursor-pointer",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", iconColor)}>
          <Icon size={16} aria-hidden />
        </div>
        <p className="sec !mb-0">{label}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-[color:var(--muted)]">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 text-xs">
          {delta > 0 ? (
            <span className="chip chip-green flex items-center gap-1">
              <TrendingUpIcon size={11} aria-hidden />
              +{delta}
            </span>
          ) : delta < 0 ? (
            <span className="chip chip-red flex items-center gap-1">
              <TrendingDownIcon size={11} aria-hidden />
              {delta}
            </span>
          ) : (
            <span className="chip chip-gray flex items-center gap-1">
              <MinusIcon size={11} aria-hidden />0
            </span>
          )}
          {deltaLabel && <span className="text-[color:var(--muted)]">{deltaLabel}</span>}
        </div>
      )}
    </El>
  )
}
