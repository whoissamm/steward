"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface GlassCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  markedDates?: string[] // YYYY-MM-DD
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function iso(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function sameDay(a: Date | undefined, b: Date) {
  if (!a) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function GlassCalendar({
  selected,
  onSelect,
  markedDates,
}: GlassCalendarProps) {
  const initial = selected ?? new Date()
  const [viewMonth, setViewMonth] = useState<number>(initial.getMonth())
  const [viewYear, setViewYear] = useState<number>(initial.getFullYear())

  const markedSet = useMemo(() => new Set(markedDates ?? []), [markedDates])
  const today = new Date()

  const first = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const jsDow = first.getDay()
  const startOffset = (jsDow + 6) % 7
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  const cells: Date[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startOffset
    cells.push(new Date(viewYear, viewMonth, 1 + dayOffset))
  }

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm backdrop-blur-xl",
      )}
      style={{
        background: "color-mix(in oklab, var(--surface) 70%, transparent)",
        borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={goPrev}
          className="inline-flex size-8 items-center justify-center rounded-lg border hover:bg-[var(--surface-alt)]"
          style={{ borderColor: "var(--border)" }}
        >
          <ChevronLeft className="size-4" />
        </button>
        <h3 className="text-sm font-semibold">
          {MONTH_NAMES[viewMonth]} <span className="tabular-nums">{viewYear}</span>
        </h3>
        <button
          type="button"
          aria-label="Next month"
          onClick={goNext}
          className="inline-flex size-8 items-center justify-center rounded-lg border hover:bg-[var(--surface-alt)]"
          style={{ borderColor: "var(--border)" }}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className="pb-1 text-center text-[0.7rem] font-semibold"
            style={{ color: "var(--muted)" }}
          >
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === viewMonth
          const isSelected = sameDay(selected, d)
          const isToday = sameDay(today, d)
          const marked = markedSet.has(iso(d))
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(d)}
              aria-pressed={isSelected}
              aria-label={d.toDateString()}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-full text-sm transition-colors",
                "hover:bg-[var(--surface-alt)]",
                !inMonth && "opacity-35",
                isToday && !isSelected && "ring-1 ring-[var(--amber-400)]",
              )}
              style={
                isSelected
                  ? {
                      background: "var(--green-700)",
                      color: "white",
                    }
                  : undefined
              }
            >
              <span className="tabular-nums">{d.getDate()}</span>
              {marked && !isSelected && (
                <span
                  aria-hidden
                  className="absolute bottom-1 size-1 rounded-full"
                  style={{ background: "var(--green-700)" }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
