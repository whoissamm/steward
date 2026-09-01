"use client"

import { useMemo } from "react"

import { cn } from "@/lib/utils"

export interface ReturnsCalendarEntry {
  date: string // YYYY-MM-DD
  value: number
  label?: string
}

export interface ReturnsCalendarProps {
  month: number // 0-11
  year: number
  entries: ReturnsCalendarEntry[]
  onDayClick?: (date: string) => void
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function iso(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0")
  const d = String(day).padStart(2, "0")
  return `${year}-${m}-${d}`
}

function fmtValue(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1000) return `${value > 0 ? "+" : "-"}${(abs / 1000).toFixed(1)}k`
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${abs}`
}

export function ReturnsCalendar({
  month,
  year,
  entries,
  onDayClick,
}: ReturnsCalendarProps) {
  const entryMap = useMemo(() => {
    const map = new Map<string, ReturnsCalendarEntry>()
    for (const e of entries) map.set(e.date, e)
    return map
  }, [entries])

  const first = new Date(year, month, 1)
  const daysCount = new Date(year, month + 1, 0).getDate()
  // Compute weekday index with Monday = 0
  const jsDow = first.getDay() // 0=Sun..6=Sat
  const startOffset = (jsDow + 6) % 7

  const totalCells = Math.ceil((startOffset + daysCount) / 7) * 7
  const cells: Array<{ day: number | null; date?: string; entry?: ReturnsCalendarEntry }> = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1
    if (dayNum < 1 || dayNum > daysCount) {
      cells.push({ day: null })
    } else {
      const date = iso(year, month, dayNum)
      cells.push({ day: dayNum, date, entry: entryMap.get(date) })
    }
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold">
          {MONTH_NAMES[month]} <span className="tabular-nums">{year}</span>
        </h3>
        <span
          className="text-xs font-medium"
          style={{ color: "var(--muted)" }}
        >
          Daily returns
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-1 text-center text-[0.7rem] font-semibold uppercase tracking-wide"
            style={{ color: "var(--muted)" }}
          >
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.day === null) {
            return <div key={i} className="aspect-square" />
          }
          const entry = cell.entry
          const positive = entry && entry.value > 0
          const negative = entry && entry.value < 0
          const zero = entry && entry.value === 0
          return (
            <button
              key={i}
              type="button"
              disabled={!onDayClick}
              onClick={() => cell.date && onDayClick?.(cell.date)}
              className={cn(
                "flex aspect-square flex-col items-start justify-between rounded-lg border p-1.5 text-left transition-colors",
                onDayClick && "hover:border-[var(--green-700)] cursor-pointer",
                !onDayClick && "cursor-default",
              )}
              style={{
                background: "var(--surface-alt)",
                borderColor: "var(--border)",
              }}
              aria-label={
                entry
                  ? `${MONTH_NAMES[month]} ${cell.day}, ${entry.label ?? "value"} ${entry.value}`
                  : `${MONTH_NAMES[month]} ${cell.day}, no entry`
              }
            >
              <span className="text-xs font-medium tabular-nums">{cell.day}</span>
              {entry ? (
                <span
                  className="inline-block max-w-full truncate rounded-md px-1 py-0.5 text-[0.65rem] font-semibold tabular-nums"
                  style={{
                    background: positive
                      ? "color-mix(in oklab, var(--green-500) 18%, transparent)"
                      : negative
                        ? "color-mix(in oklab, var(--red-500) 15%, transparent)"
                        : "var(--border)",
                    color: positive
                      ? "var(--green-700)"
                      : negative
                        ? "var(--red-600)"
                        : "var(--muted)",
                  }}
                >
                  {zero ? "0" : fmtValue(entry.value)}
                </span>
              ) : (
                <span
                  aria-hidden
                  className="inline-block h-[14px] w-6 rounded-md opacity-40"
                  style={{ background: "var(--border)" }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
