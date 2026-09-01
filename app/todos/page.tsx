"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { api, type PlanResponse, type PlanTodo } from "@/lib/api"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded, todayIso } from "@/lib/profile"
import { TodoItem, type TodoCategory } from "@/components/ui/to-do-item"
import { ShimmerLoader } from "@/components/ui/shimmer-loader"
import { AchievementUnlocked } from "@/components/ui/achievement-unlocked"
import { BADGES } from "@/lib/gamification"
import { AwardIcon, ClipboardListIcon, InfoIcon, SparklesIcon } from "lucide-react"

function categoriseTodo(text: string): TodoCategory {
  const t = text.toLowerCase()
  if (/frost|rain|wind|weather|forecast/.test(t)) return "weather"
  if (/stock|sheep|cattle|graz|flock|ewe|ram|lamb|herd/.test(t)) return "livestock"
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

  async function tick(t: PlanTodo, next: boolean) {
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

  const completedToday = useMemo(() => {
    return profile.completed_dates.includes(todayIso())
  }, [profile.completed_dates])

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
      <header className="flex flex-col gap-1">
        <p className="sec">Today&apos;s plan</p>
        <h1 className="text-2xl font-bold">
          {completedToday ? "You’re on top of it — well done." : "What we’d tick off today"}
        </h1>
        <p className="text-[color:var(--muted)]">
          Tailored to your {profile.farm_type} setup and the season.
          {plan && <> · <span className="capitalize font-semibold text-[color:var(--fg)]">{plan.season}</span></>}
        </p>
      </header>

      {!plan && !error && (
        <div className="card"><ShimmerLoader lines={4} /></div>
      )}

      {error && !plan && (
        <div className="card" role="alert">
          <p className="text-sm">Could not load today&apos;s plan: {error}</p>
        </div>
      )}

      {plan && (
        <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="flex flex-col gap-2">
          {plan.todos.map((t) => (
            <TodoItem
              key={t.id}
              id={t.id}
              label={t.text}
              done={!!done[t.id]}
              category={categoriseTodo(t.text)}
              onToggle={(_, next) => tick(t, next)}
            />
          ))}
        </motion.ul>
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
        href="/agents/steward?q=Add%20one%20more%20task%20to%20my%20day"
        className="card flex items-center gap-3 hover:border-[color:var(--green-600)] transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-[color:var(--amber-100)] text-[color:var(--amber-700)] flex items-center justify-center flex-shrink-0">
          <SparklesIcon size={22} aria-hidden />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Ask an agent to add a task</p>
          <p className="text-xs text-[color:var(--muted)]">
            Steward can suggest what else to check today based on your farm and weather.
          </p>
        </div>
        <ClipboardListIcon size={16} className="text-[color:var(--muted)]" aria-hidden />
      </Link>

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
