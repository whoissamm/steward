"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { api, type PlanResponse, type PlanTodo } from "@/lib/api"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded, todayIso, type TodoItem as ProfileTodo } from "@/lib/profile"
import { TodoItem, type TodoCategory } from "@/components/ui/to-do-item"
import { ShimmerLoader } from "@/components/ui/shimmer-loader"
import { AchievementUnlocked } from "@/components/ui/achievement-unlocked"
import { BADGES } from "@/lib/gamification"
import { AwardIcon, ClipboardListIcon, InfoIcon, SparklesIcon, TrashIcon, PlusIcon, MessageCircleIcon } from "lucide-react"

function categoriseTodo(text: string): TodoCategory {
  const t = text.toLowerCase()
  if (/frost|rain|wind|weather|forecast/.test(t)) return "weather"
  if (/stock|sheep|cattle|graz|flock|ewe|ram|lamb|herd|dog|vet/.test(t)) return "livestock"
  if (/soil|nutrient|water|irrigat|drilling|fertilis/.test(t)) return "soil"
  if (/scheme|sfi|grant|claim|application/.test(t)) return "grants"
  if (/record|diary|book|map/.test(t)) return "records"
  return "general"
}

export default function TodosPage() {
  const router = useRouter()
  const { profile, loaded, update, markCompletion, logActivity } = useProfile()
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [unlocked, setUnlocked] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newTodo, setNewTodo] = useState("")

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) router.replace("/login")
  }, [loaded, profile, router])

  useEffect(() => {
    if (!loaded) return
    let cancelled = false
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
  }, [loaded, profile.farm_type, profile.has_sensors])

  const userTodos = profile.todos ?? []

  async function tickPlan(t: PlanTodo, next: boolean) {
    if (!next) {
      setDone((d) => ({ ...d, [t.id]: false }))
      return
    }
    setDone((d) => ({ ...d, [t.id]: true }))
    try {
      const res = await api.progress("todo_done", t.id, profile)
      logActivity(`todo:${t.id}`, { text: t.text })
      markCompletion()
      update({
        points: res.total_points,
        badges: Array.from(new Set([...profile.badges, ...res.new_badges])),
      })
      if (res.new_badges.length > 0) setUnlocked(res.new_badges[0])
    } catch (e) {
      setDone((d) => ({ ...d, [t.id]: false }))
      setError((e as Error).message)
    }
  }

  async function tickUserTodo(t: ProfileTodo, next: boolean) {
    const updated = userTodos.map((x) => (x.id === t.id ? { ...x, done: next } : x))
    update({ todos: updated })
    if (next) {
      try {
        const res = await api.progress("todo_done", t.id, profile)
        logActivity(`todo:${t.id}`, { text: t.text })
        markCompletion()
        update({
          points: res.total_points,
          badges: Array.from(new Set([...profile.badges, ...res.new_badges])),
        })
        if (res.new_badges.length > 0) setUnlocked(res.new_badges[0])
      } catch {
        // Local state already updated; server points are best-effort
      }
    }
  }

  function addManualTodo() {
    const text = newTodo.trim()
    if (!text) return
    const item: ProfileTodo = {
      id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      category: categoriseTodo(text),
      done: false,
      created_at: new Date().toISOString(),
      source: "manual",
    }
    update({ todos: [...userTodos, item] })
    setNewTodo("")
    setAddOpen(false)
  }

  function removeUserTodo(id: string) {
    update({ todos: userTodos.filter((t) => t.id !== id) })
  }

  const completedToday = useMemo(
    () => profile.completed_dates.includes(todayIso()),
    [profile.completed_dates],
  )

  const badgeMeta = unlocked ? BADGES[unlocked] : null

  if (!loaded) {
    return (
      <main className="screen">
        <div className="card"><ShimmerLoader lines={4} /></div>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="sec">Today&apos;s plan</p>
          <h1 className="text-2xl font-bold">
            {completedToday ? "You’re on top of it — well done." : "What we’d tick off today"}
          </h1>
          <p className="text-[color:var(--muted)]">
            Tailored to your {profile.farm_type} setup and the season.
            {plan && <> · <span className="capitalize font-semibold text-[color:var(--fg)]">{plan.season}</span></>}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setAddOpen(true)}>
          <PlusIcon size={16} aria-hidden /> Add
        </button>
      </header>

      {/* Your list — user + chat added */}
      {userTodos.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="sec">Your list</p>
          <motion.ul className="flex flex-col gap-2">
            {userTodos.map((t) => (
              <li key={t.id} className="relative">
                <TodoItem
                  id={t.id}
                  label={t.text}
                  done={!!t.done}
                  category={(t.category as TodoCategory) ?? categoriseTodo(t.text)}
                  meta={t.source === "chat" ? "From chat" : undefined}
                  onToggle={(_, next) => tickUserTodo(t, next)}
                />
                <button
                  type="button"
                  aria-label={`Remove ${t.text}`}
                  onClick={() => removeUserTodo(t.id)}
                  className="btn-ghost !p-1.5 absolute top-2 right-2"
                >
                  <TrashIcon size={12} aria-hidden />
                </button>
              </li>
            ))}
          </motion.ul>
        </section>
      )}

      {!plan && !error && <div className="card"><ShimmerLoader lines={4} /></div>}
      {error && !plan && (
        <div className="card" role="alert">
          <p className="text-sm">Could not load today&apos;s plan: {error}</p>
        </div>
      )}

      {plan && (
        <section className="flex flex-col gap-2">
          <p className="sec">Suggested for today</p>
          <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="flex flex-col gap-2">
            {plan.todos.map((t) => (
              <TodoItem
                key={t.id}
                id={t.id}
                label={t.text}
                done={!!done[t.id]}
                category={categoriseTodo(t.text)}
                onToggle={(_, next) => tickPlan(t, next)}
              />
            ))}
          </motion.ul>
        </section>
      )}

      {plan && plan.reminders.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="sec">Reminders</p>
          {plan.reminders.map((r, i) => (
            <div key={i} className="card card-tight flex items-start gap-2 text-sm">
              <InfoIcon size={14} className="mt-0.5 flex-shrink-0 text-[color:var(--muted)]" aria-hidden />
              <span className="text-[color:var(--muted)]">{r}</span>
            </div>
          ))}
        </section>
      )}

      <Link
        href="/agents/steward?q=Add%20a%20task%20to%20my%20to-do%20list"
        className="card flex items-center gap-3 hover:border-[color:var(--green-600)] transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-[color:var(--amber-100)] text-[color:var(--amber-700)] flex items-center justify-center flex-shrink-0">
          <MessageCircleIcon size={22} aria-hidden />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Ask an agent to add a task</p>
          <p className="text-xs text-[color:var(--muted)]">
            Chat with an agent — say &ldquo;add feed the ewes to my to-do list&rdquo;.
          </p>
        </div>
        <ClipboardListIcon size={16} className="text-[color:var(--muted)]" aria-hidden />
      </Link>

      {/* Add-todo modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/50"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="card w-full max-w-md flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="sec">Add a task</p>
            <input
              type="text"
              className="input"
              placeholder="e.g. Check fence in South Field"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addManualTodo() }}
              autoFocus
              enterKeyHint="done"
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={addManualTodo} disabled={!newTodo.trim()}>
                <PlusIcon size={14} aria-hidden /> Add
              </button>
            </div>
            <p className="text-xs text-[color:var(--muted)] flex items-center gap-1">
              <SparklesIcon size={11} aria-hidden className="text-[color:var(--amber-500)]" />
              Or ask any agent to add it for you — they know your list.
            </p>
          </div>
        </div>
      )}

      {badgeMeta && (
        <AchievementUnlocked
          open
          onClose={() => setUnlocked(null)}
          name={badgeMeta.name}
          description={badgeMeta.description}
          icon={AwardIcon}
        />
      )}
    </main>
  )
}
