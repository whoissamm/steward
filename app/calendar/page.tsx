"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded, type CalendarEvent } from "@/lib/profile"
import { EventCalendar } from "@/components/ui/event-calendar"
import { AiPromptBox } from "@/components/ui/ai-prompt-box"
import { CalendarDaysIcon, PlusIcon, SparklesIcon, TrashIcon, XIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function todayIsoLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const SUGGESTED_EVENTS = [
  { offsetDays: 3, title: "Walk North Field for pests", kind: "todo" as const },
  { offsetDays: 7, title: "Check soil moisture", kind: "advisory" as const },
  { offsetDays: 14, title: "Review scheme deadlines", kind: "scheme" as const },
]

export default function CalendarPage() {
  const router = useRouter()
  const { profile, loaded, update } = useProfile()
  // The single "day sheet" — tapping a day shows what's on / lets you add.
  // Never mutates on chip click (previous version's silent bug).
  const [openDay, setOpenDay] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState("")

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) router.replace("/login")
  }, [loaded, profile, router])

  const events = useMemo(() => profile.events || [], [profile.events])

  function addEvent(title: string, dateOverride?: string, kind: CalendarEvent["kind"] = "todo") {
    const date = dateOverride || openDay || todayIsoLocal()
    const id = `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    update({
      events: [...events, { id, date, title, kind }],
    })
    setDraftTitle("")
  }

  function removeEvent(id: string) {
    update({ events: events.filter((e) => e.id !== id) })
  }

  function addSuggested(idx: number) {
    const s = SUGGESTED_EVENTS[idx]
    const d = new Date()
    d.setDate(d.getDate() + s.offsetDays)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    addEvent(s.title, iso, s.kind)
  }

  if (!loaded) {
    return (
      <main className="screen">
        <p className="text-sm text-[color:var(--muted)]">Loading calendar…</p>
      </main>
    )
  }

  const upcoming = events
    .filter((e) => e.date >= todayIsoLocal())
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 5)

  const eventsForOpenDay = openDay ? events.filter((e) => e.date === openDay).sort((a, b) => a.title.localeCompare(b.title)) : []
  const openDayLabel = openDay
    ? new Date(openDay).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : ""

  return (
    <main className="screen">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="sec">Farm calendar</p>
          <h1 className="text-2xl font-bold">Your month at a glance</h1>
        </div>
        <button type="button" className="btn-primary" onClick={() => setOpenDay(todayIsoLocal())}>
          <PlusIcon size={16} aria-hidden /> Add
        </button>
      </header>

      <EventCalendar
        events={events}
        onDayClick={(iso) => setOpenDay(iso)}
        // NOTE: chip clicks are intentionally NOT wired to remove any more.
        // Removing happens from inside the day-sheet, never from the grid.
      />

      <section className="flex flex-col gap-2">
        <p className="sec flex items-center gap-1"><CalendarDaysIcon size={12} aria-hidden /> Upcoming</p>
        {upcoming.length === 0 ? (
          <div className="card card-tight text-sm text-[color:var(--muted)]">
            Nothing scheduled — tap a day to add.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((e) => (
              <li key={e.id} className="card card-tight flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpenDay(e.date)}
                  className="text-xs font-semibold text-[color:var(--muted)] w-20 flex-shrink-0 text-left hover:text-[color:var(--fg)]"
                  aria-label={`Open ${e.date}`}
                >
                  {new Date(e.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                </button>
                <span className="flex-1 text-sm">{e.title}</span>
                <button
                  type="button"
                  className="btn-ghost !p-1.5"
                  onClick={() => removeEvent(e.id)}
                  aria-label={`Remove ${e.title}`}
                >
                  <TrashIcon size={14} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/agents/steward?q=What%20should%20I%20plan%20for%20this%20week"
        className="card card-tight flex items-center gap-2 text-sm hover:border-[color:var(--green-600)]"
      >
        <SparklesIcon size={14} className="text-[color:var(--amber-500)]" aria-hidden />
        Ask an agent to plan your week
      </Link>

      {/* Day sheet — view + add + delete for a specific date */}
      <AnimatePresence>
        {openDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/50"
            onClick={() => setOpenDay(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="card w-full max-w-md flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={`Events on ${openDayLabel}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="sec !mb-0">Day</p>
                  <h3 className="text-lg font-bold leading-tight">{openDayLabel}</h3>
                </div>
                <button
                  type="button"
                  className="btn-ghost !p-1.5"
                  onClick={() => setOpenDay(null)}
                  aria-label="Close"
                >
                  <XIcon size={16} aria-hidden />
                </button>
              </div>

              {/* Existing events on this day */}
              {eventsForOpenDay.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {eventsForOpenDay.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center gap-2 p-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: kindColor(e.kind) }}
                        aria-hidden
                      />
                      <span className="flex-1 text-sm">{e.title}</span>
                      <button
                        type="button"
                        className="btn-ghost !p-1.5"
                        onClick={() => removeEvent(e.id)}
                        aria-label={`Remove ${e.title}`}
                      >
                        <TrashIcon size={12} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[color:var(--muted)] italic">Nothing on this day yet.</p>
              )}

              {/* Add new — quick input */}
              <div className="border-t border-[color:var(--border)] pt-3 flex flex-col gap-2">
                <p className="sec !mb-0">Add to this day</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="e.g. Book vet visit"
                    value={draftTitle}
                    onChange={(ev) => setDraftTitle(ev.target.value)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" && draftTitle.trim()) {
                        addEvent(draftTitle.trim())
                      }
                    }}
                    autoFocus={eventsForOpenDay.length === 0}
                    enterKeyHint="done"
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => draftTitle.trim() && addEvent(draftTitle.trim())}
                    disabled={!draftTitle.trim()}
                  >
                    <PlusIcon size={16} aria-hidden />
                  </button>
                </div>
              </div>

              {/* Suggested events (only when the day sheet is TODAY-ish for relevance) */}
              {openDay === todayIsoLocal() && (
                <div className="border-t border-[color:var(--border)] pt-3">
                  <p className="text-xs font-semibold text-[color:var(--muted)] mb-2 flex items-center gap-1">
                    <SparklesIcon size={11} aria-hidden /> Steward suggests
                  </p>
                  <div className="flex flex-col gap-1">
                    {SUGGESTED_EVENTS.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => addSuggested(i)}
                        className="text-left text-sm px-3 py-2 rounded-lg hover:bg-[color:var(--surface-alt)]"
                      >
                        + {s.title}{" "}
                        <span className="text-[color:var(--muted)]">
                          (in {s.offsetDays} days)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function kindColor(kind: CalendarEvent["kind"]): string {
  switch (kind) {
    case "advisory":
      return "var(--green-600)"
    case "weather":
      return "#0284c7"
    case "scheme":
      return "#7c3aed"
    case "todo":
    default:
      return "var(--amber-500)"
  }
}
