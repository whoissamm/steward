"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Flame } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StreakCalendarProps {
  completedDates: string[]
  year?: number
  onDayClick?: (date: string) => void
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function iso(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0")
  const d = String(day).padStart(2, "0")
  return `${year}-${m}-${d}`
}

function computeStreak(completed: Set<string>) {
  // Count consecutive days ending today (or the most recent completed day).
  const today = new Date()
  let streak = 0
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  // If today is not completed, start streak from most-recent completed day.
  if (!completed.has(iso(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (completed.has(iso(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function StreakCalendar({
  completedDates,
  year: initialYear,
  onDayClick,
}: StreakCalendarProps) {
  const [year, setYear] = useState<number>(initialYear ?? new Date().getFullYear())

  const completedSet = useMemo(() => new Set(completedDates), [completedDates])
  const streak = useMemo(() => computeStreak(completedSet), [completedSet])

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "var(--green-700)" }}
        >
          <Flame className="size-4" aria-hidden />
          <span>{streak} day streak</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous year"
            onClick={() => setYear((y) => y - 1)}
            className="inline-flex size-7 items-center justify-center rounded-md hover:bg-[var(--surface-alt)]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[3.5rem] text-center text-sm font-medium tabular-nums">
            {year}
          </span>
          <button
            type="button"
            aria-label="Next year"
            onClick={() => setYear((y) => y + 1)}
            className="inline-flex size-7 items-center justify-center rounded-md hover:bg-[var(--surface-alt)]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {MONTHS.map((label, month) => {
          const total = daysInMonth(year, month)
          return (
            <div key={month} className="flex items-center gap-2">
              <span
                className="w-8 shrink-0 text-[0.7rem] font-medium uppercase tracking-wide"
                style={{ color: "var(--muted)" }}
              >
                {label}
              </span>
              <div className="flex flex-wrap gap-[3px]">
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1
                  if (day > total) {
                    return (
                      <span
                        key={i}
                        aria-hidden
                        className="size-2 rounded-[2px] opacity-0"
                      />
                    )
                  }
                  const date = iso(year, month, day)
                  const done = completedSet.has(date)
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`${label} ${day}${done ? ", completed" : ""}`}
                      onClick={() => onDayClick?.(date)}
                      className={cn(
                        "size-2 rounded-[2px] transition-transform hover:scale-125",
                        onDayClick ? "cursor-pointer" : "cursor-default",
                      )}
                      style={{
                        background: done ? "var(--green-700)" : "var(--surface-alt)",
                        border: `1px solid ${done ? "var(--green-800)" : "var(--border)"}`,
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
