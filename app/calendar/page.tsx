"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded, type CalendarEvent } from "@/lib/profile"
import { EventCalendar } from "@/components/ui/event-calendar"
import { AiPromptBox } from "@/components/ui/ai-prompt-box"
import { CalendarDaysIcon, PlusIcon, SparklesIcon, TrashIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const KIND_OPTIONS: CalendarEvent["kind"][] = ["todo", "advisory", "weather", "scheme"]

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
  const [addOpen, setAddOpen] = useState(false)
  const [pickDate, setPickDate] = useState<string | null>(null)

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) router.replace("/login")
  }, [loaded, profile, router])

  const events = useMemo(() => profile.events || [], [profile.events])

  function addEvent(title: string, dateOverride?: string, kind: CalendarEvent["kind"] = "todo") {
    const date = dateOverride || pickDate || todayIsoLocal()
    const id = `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    update({
      events: [...events, { id, date, title, kind }],
    })
    setAddOpen(false)
    setPickDate(null)
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

  return (
    <main className="screen">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="sec">Farm calendar</p>
          <h1 className="text-2xl font-bold">Your month at a glance</h1>
        </div>
        <button type="button" className="btn-primary" onClick={() => setAddOpen(true)}>
          <PlusIcon size={16} aria-hidden /> Add
        </button>
      </header>

      <EventCalendar
        events={events}
        onDayClick={(iso) => {
          setPickDate(iso)
          setAddOpen(true)
        }}
        onEventClick={(id) => removeEvent(id)}
      />

      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/50"
            onClick={() => setAddOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="card w-full max-w-md flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="sec">Add event</p>
              <label className="flex flex-col gap-1 text-sm">
                Date
                <input
                  type="date"
                  className="input"
                  value={pickDate || todayIsoLocal()}
                  onChange={(e) => setPickDate(e.target.value)}
                />
              </label>
              <AiPromptBox
                onSubmit={(text) => addEvent(text)}
                placeholder="e.g. Book soil test"
                showVoice={false}
              />
              <div className="border-t border-[color:var(--border)] pt-3">
                <p className="text-xs font-semibold text-[color:var(--muted)] mb-2 flex items-center gap-1">
                  <SparklesIcon size={11} aria-hidden /> Suggested by Steward
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_EVENTS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addSuggested(i)}
                      className="text-left text-sm px-3 py-2 rounded-lg hover:bg-[color:var(--surface-alt)]"
                    >
                      + {s.title} <span className="text-[color:var(--muted)]">(in {s.offsetDays} days)</span>
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" className="btn-ghost self-end" onClick={() => setAddOpen(false)}>
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <span className="text-xs font-semibold text-[color:var(--muted)] w-20 flex-shrink-0">
                  {new Date(e.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                </span>
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
    </main>
  )
}
