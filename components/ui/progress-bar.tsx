"use client"

import { cn } from "@/lib/utils"

export interface ProgressBarProps {
  value?: number // 0-100; undefined = indeterminate
  label?: string
  showState?: boolean
  height?: number
  className?: string
}

export function ProgressBar({
  value,
  label,
  showState = true,
  height = 8,
  className,
}: ProgressBarProps) {
  const isIndeterminate = value === undefined
  const isComplete = !isIndeterminate && value >= 100
  const clampedValue = isIndeterminate ? 0 : Math.min(100, Math.max(0, value))

  const barColor = isComplete
    ? "bg-emerald-500"
    : "bg-primary"

  const trackColor = isComplete
    ? "bg-emerald-100 dark:bg-emerald-950"
    : "bg-muted"

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {/* Label row */}
      {(label || showState) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="text-foreground font-medium">{label}</span>
          )}
          {showState && !isIndeterminate && (
            <span
              className={cn(
                "text-muted-foreground font-medium tabular-nums",
                isComplete && "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isComplete ? "Complete" : `${Math.round(clampedValue)}%`}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        aria-valuetext={isIndeterminate ? "Loading" : isComplete ? "Complete" : `${Math.round(clampedValue)}%`}
        aria-label={label}
        className={cn("relative w-full overflow-hidden rounded-full", trackColor)}
        style={{ height }}
      >
        {isIndeterminate ? (
          /* Indeterminate sliding bar */
          <div
            className="absolute inset-y-0 rounded-full bg-primary animate-indeterminate"
            style={{ width: "40%" }}
          />
        ) : (
          /* Determinate fill + shimmer */
          <div
            className={cn(
              "relative h-full rounded-full transition-all duration-500 ease-out overflow-hidden",
              barColor
            )}
            style={{ width: `${clampedValue}%` }}
          >
            {/* Shimmer overlay */}
            {!isComplete && clampedValue > 0 && (
              <div
                className="absolute inset-0 animate-shimmer"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
              />
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-indeterminate {
          animation: indeterminate 1.4s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 1.6s linear infinite;
        }
      `}</style>
    </div>
  )
}
