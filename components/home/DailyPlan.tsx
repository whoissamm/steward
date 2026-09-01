"use client"

import { useEffect, useState } from "react"
import { api, type PlanResponse, type PlanTodo, type Profile } from "@/lib/api"
import { CheckIcon, InfoIcon, AlertCircleIcon } from "lucide-react"

export function DailyPlan({
  profile,
  onProgress,
}: {
  profile: Profile
  onProgress?: (result: { total_points: number; level: string; new_badges: string[] }) => void
}) {
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    api
      .plan(profile.farm_type, profile.has_sensors)
      .then((p) => {
        if (!cancelled) setPlan(p)
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message)
      })
    return () => {
      cancelled = true
    }
  }, [profile.farm_type, profile.has_sensors])

  async function tick(todo: PlanTodo) {
    if (done[todo.id] || busy) return
    setBusy(todo.id)
    setDone((d) => ({ ...d, [todo.id]: true }))
    try {
      const res = await api.progress("todo_done", todo.id, profile)
      setError(null)
      onProgress?.({ total_points: res.total_points, level: res.level, new_badges: res.new_badges })
    } catch (e) {
      setDone((d) => ({ ...d, [todo.id]: false }))
      setError((e as Error).message || "Could not save that tick.")
    } finally {
      setBusy(null)
    }
  }

  if (!plan && error) {
    return (
      <section className="card flex flex-col gap-2" role="alert">
        <p className="sec">Today on your farm</p>
        <p className="text-sm flex items-start gap-2">
          <AlertCircleIcon size={14} className="mt-0.5 text-[color:var(--red-500)]" aria-hidden />
          <span>Could not load today&apos;s plan: {error}</span>
        </p>
      </section>
    )
  }
  if (!plan) {
    return (
      <section className="card flex flex-col gap-3">
        <p className="sec">Today on your farm</p>
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </section>
    )
  }

  return (
    <section className="card flex flex-col gap-3" aria-label="Daily plan">
      <div className="flex items-center justify-between">
        <p className="sec">Today on your farm</p>
        <span className="chip chip-green capitalize">{plan.season}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {plan.todos.map((t) => {
          const isDone = done[t.id]
          return (
            <li key={t.id}>
              <button
                type="button"
                className="w-full flex items-start gap-3 text-left p-2 rounded-lg hover:bg-[color:var(--surface-alt)] transition min-h-[48px]"
                onClick={() => tick(t)}
                disabled={isDone || !!busy}
                aria-pressed={isDone}
              >
                <span
                  className={
                    "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-0.5 transition " +
                    (isDone
                      ? "bg-[color:var(--green-700)] border-[color:var(--green-700)] text-white"
                      : "border-[color:var(--stone-400)]")
                  }
                >
                  {isDone && <CheckIcon size={14} aria-hidden />}
                </span>
                <span
                  className={
                    "flex-1 text-sm leading-snug " +
                    (isDone ? "line-through text-[color:var(--muted)]" : "")
                  }
                >
                  {t.text}
                </span>
                {isDone && <span className="chip chip-amber flex-shrink-0">+5</span>}
              </button>
            </li>
          )
        })}
      </ul>
      {error && (
        <p className="text-xs text-[color:var(--red-600)] flex items-start gap-2" role="alert">
          <AlertCircleIcon size={12} className="mt-0.5" aria-hidden />
          <span>{error}</span>
        </p>
      )}
      {plan.reminders.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-[color:var(--border)]">
          {plan.reminders.map((r, i) => (
            <p key={i} className="text-xs text-[color:var(--muted)] flex items-start gap-2">
              <InfoIcon size={12} className="mt-0.5 flex-shrink-0" aria-hidden />
              <span>{r}</span>
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
