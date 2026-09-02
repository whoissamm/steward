"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  FlameIcon,
  DropletIcon,
  ClipboardListIcon,
  TrendingUpIcon,
  CalendarDaysIcon,
  ThermometerIcon,
  WindIcon,
  ArrowRightIcon,
  AwardIcon,
  BookOpenIcon,
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { useSensors } from "@/hooks/useSensors"
import { greetingFor } from "@/lib/dialect"
import { hasOnboarded, totalNetProfit, todayIso } from "@/lib/profile"
import { levelFor, nextLevel, BADGES } from "@/lib/gamification"
import { StatWidget } from "@/components/ui/stat-widget"
import { HealthBar } from "@/components/ui/health-bar"
import { ShimmerLoader } from "@/components/ui/shimmer-loader"
import { useIsMobile } from "@/hooks/useIsMobile"

export default function HomePage() {
  const router = useRouter()
  const { profile, loaded } = useProfile()
  const { readings } = useSensors(!!profile.has_sensors)

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) {
      router.replace("/login")
    }
  }, [loaded, profile, router])

  if (!loaded || !hasOnboarded(profile)) {
    return (
      <main className="screen">
        <div className="card"><ShimmerLoader lines={4} /></div>
        <div className="card"><ShimmerLoader lines={3} /></div>
      </main>
    )
  }

  const greeting = greetingFor(profile.accent, profile.name)
  const level = levelFor(profile.points)
  const next = nextLevel(profile.points)
  const profitTotal = totalNetProfit(profile.profit_entries)
  const farmHealth = computeFarmHealth(profile.streak, profile.turns, profile.badges.length, readings?.soil_moisture)
  const t = todayIso()
  const completedToday = profile.completed_dates.includes(t)

  return (
    <main className="screen">
      <HomeHero greeting={greeting} name={profile.name} level={level} next={next} streak={profile.streak} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="card"
      >
        <HealthBar label="Farm health score" value={farmHealth} max={100} />
        <p className="text-xs text-[color:var(--muted)] mt-2">
          Built from your streak, sensor readings, learning progress and completed tasks.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatWidget
          icon={ClipboardListIcon}
          label="Today's plan"
          value={completedToday ? "On track" : "Open"}
          tone={completedToday ? "green" : "amber"}
          onClick={() => router.push("/todos")}
        />
        <StatWidget
          icon={CalendarDaysIcon}
          label="This week"
          value={weekEvents(profile.events)}
          unit="events"
          tone="neutral"
          onClick={() => router.push("/calendar")}
        />
        <StatWidget
          icon={AwardIcon}
          label="Badges"
          value={profile.badges.length}
          unit={`/ ${Object.keys(BADGES).length}`}
          tone="amber"
          onClick={() => router.push("/achievements")}
        />
        <StatWidget
          icon={TrendingUpIcon}
          label="Net this month"
          value={profitTotal >= 0 ? `£${profitTotal.toFixed(0)}` : `−£${Math.abs(profitTotal).toFixed(0)}`}
          tone={profitTotal >= 0 ? "green" : "red"}
          onClick={() => router.push("/profit")}
        />
      </motion.section>

      {profile.has_sensors && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="card flex flex-col gap-3"
        >
          <div className="flex items-baseline justify-between">
            <p className="sec !mb-0 flex items-center gap-1">
              <DropletIcon size={12} aria-hidden /> Live from the farm
            </p>
            <Link href="/sensors" className="text-xs text-[color:var(--green-700)] font-semibold flex items-center gap-1">
              Full panel <ArrowRightIcon size={12} aria-hidden />
            </Link>
          </div>
          {readings ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat Icon={DropletIcon} value={readings.soil_moisture} unit="%" label="Soil" />
              <MiniStat Icon={ThermometerIcon} value={readings.air_temp} unit="°C" label="Air" />
              <MiniStat Icon={WindIcon} value={readings.wind} unit="kph" label="Wind" />
            </div>
          ) : (
            <ShimmerLoader lines={2} />
          )}
          {readings && readings.alerts.length > 0 && (
            <p className="text-xs text-[color:var(--amber-700)] font-medium">
              {readings.alerts[0].message}
            </p>
          )}
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Link
          href="/learn"
          className="card flex items-center gap-3 hover:border-[color:var(--green-600)] transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[color:var(--amber-100)] text-[color:var(--amber-700)] flex items-center justify-center flex-shrink-0">
            <BookOpenIcon size={22} aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">Continue the course</p>
            <p className="text-xs text-[color:var(--muted)] truncate">
              {profile.lesson_done.length}/8 lessons · {profile.quiz_done.length} quizzes
            </p>
          </div>
          <ArrowRightIcon size={16} className="text-[color:var(--muted)]" aria-hidden />
        </Link>
      </motion.section>
    </main>
  )
}

function HomeHero({
  greeting,
  name,
  level,
  next,
  streak,
}: {
  greeting: string
  name: string
  level: string
  next: { name: string; needed: number; progress: number } | null
  streak: number
}) {
  const hour = new Date().getHours()
  const timeOfDay =
    hour < 6 ? "Late night" :
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    hour < 21 ? "Good evening" : "Good night"

  // Split greeting into words for staggered per-word reveal
  const words = greeting.split(/(\s+)/) // keep whitespace

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-3 pt-2"
    >
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--green-700)]"
      >
        {timeOfDay}, {name || "friend"}
      </motion.p>
      <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight">
        {words.map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.045, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {w === " " ? " " : w}
          </motion.span>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 + words.length * 0.06, duration: 0.4 }}
          className="text-[color:var(--green-700)]"
        >
          .
        </motion.span>
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="text-[color:var(--muted)] flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
      >
        <span>{level}</span>
        {next && <><span aria-hidden>·</span><span>{next.needed} pts to {next.name}</span></>}
        {streak > 0 && (
          <>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <FlameIcon className="text-[color:var(--amber-500)]" size={14} aria-hidden />
              {streak}-day streak
            </span>
          </>
        )}
      </motion.p>
    </motion.section>
  )
}

function MiniStat({ Icon, value, unit, label }: { Icon: typeof DropletIcon; value: number; unit: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 rounded-lg bg-[color:var(--surface-alt)]">
      <Icon size={14} className="text-[color:var(--muted)]" aria-hidden />
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold tabular-nums">{value}</span>
        <span className="text-xs text-[color:var(--muted)]">{unit}</span>
      </div>
      <span className="text-[10px] text-[color:var(--muted)] uppercase tracking-wider">{label}</span>
    </div>
  )
}

function weekEvents(events: { date: string }[]): number {
  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return events.filter((e) => {
    const d = new Date(e.date)
    return d >= now && d <= in7
  }).length
}

function computeFarmHealth(streak: number, turns: number, badges: number, soilMoisture?: number): number {
  let score = 25
  score += Math.min(25, streak * 2.5)
  score += Math.min(20, turns * 1)
  score += Math.min(15, badges * 2.5)
  if (soilMoisture !== undefined) {
    if (soilMoisture >= 20 && soilMoisture <= 35) score += 15
    else score += 5
  } else {
    score += 5
  }
  return Math.min(100, Math.round(score))
}
