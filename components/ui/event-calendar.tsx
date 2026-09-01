"use client"

import { useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type CalendarEvent = {
  id: string
  date: string
  title: string
  kind?: "todo" | "advisory" | "weather" | "scheme"
}

const KIND_STYLE: Record<NonNullable<CalendarEvent["kind"]>, string> = {
  todo: "bg-[color:var(--amber-100)] text-[color:var(--amber-700)] border-[color:var(--amber-200)]",
  advisory: "bg-[color:color-mix(in_oklab,var(--green-500)_15%,var(--surface))] text-[color:var(--green-800)] border-[color:color-mix(in_oklab,var(--green-500)_25%,var(--border))]",
  weather: "bg-[#dbeafe] text-[#1e3a8a] border-[#93c5fd]",
  scheme: "bg-[#f3e8ff] text-[#6b21a8] border-[#d8b4fe]",
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function EventCalendar({
  events,
  initialDate = new Date(),
  onEventClick,
  onDayClick,
}: {
  events: CalendarEvent[]
  initialDate?: Date
  onEventClick?: (id: string) => void
  onDayClick?: (isoDate: string) => void
}) {
  const [cursor, setCursor] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))

  const grid = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const first = new Date(year, month, 1)
    // Monday-start
    const firstWeekday = (first.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: { date: Date; isCurrent: boolean; iso: string }[] = []
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      cells.push({ date: d, isCurrent: false, iso: iso(d) })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d)
      cells.push({ date: dt, isCurrent: true, iso: iso(dt) })
    }
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date
      const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
      cells.push({ date: next, isCurrent: false, iso: iso(next) })
    }
    return cells
  }, [cursor])

  const byDate = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const list = m.get(e.date) ?? []
      list.push(e)
      m.set(e.date, list)
    }
    return m
  }, [events])

  const label = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          aria-label="Previous month"
          className="btn-ghost !p-2"
        >
          <ChevronLeftIcon size={18} aria-hidden />
        </button>
        <h3 className="font-semibold">{label}</h3>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          aria-label="Next month"
          className="btn-ghost !p-2"
        >
          <ChevronRightIcon size={18} aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-[color:var(--muted)] font-semibold">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map(({ date, isCurrent, iso: k }) => {
          const dayEvents = byDate.get(k) ?? []
          const isToday = k === iso(new Date())
          return (
            <button
              key={k}
              type="button"
              onClick={() => onDayClick?.(k)}
              className={cn(
                "min-h-[64px] p-1 rounded-lg border text-left flex flex-col gap-0.5 transition-colors",
                isCurrent
                  ? "border-[color:var(--border)] bg-[color:var(--surface)]"
                  : "border-transparent bg-[color:var(--surface-alt)]/40 opacity-50",
                isToday && "ring-2 ring-[color:var(--green-600)] ring-offset-1 ring-offset-[color:var(--surface)]",
                onDayClick && "hover:border-[color:var(--green-500)]",
              )}
            >
              <span className={cn("text-[11px] font-semibold", isToday ? "text-[color:var(--green-700)]" : "text-[color:var(--fg)]")}>
                {date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    role={onEventClick ? "button" : undefined}
                    onClick={(ev) => {
                      if (!onEventClick) return
                      ev.stopPropagation()
                      onEventClick(e.id)
                    }}
                    className={cn(
                      "text-[10px] leading-tight px-1 py-0.5 rounded truncate border",
                      KIND_STYLE[e.kind ?? "todo"],
                    )}
                    title={e.title}
                  >
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-[color:var(--muted)] px-1">+{dayEvents.length - 2}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {events.length === 0 && (
        <p className="text-sm text-[color:var(--muted)] text-center py-4">
          No planned tasks — try asking Steward for advice.
        </p>
      )}
    </div>
  )
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
