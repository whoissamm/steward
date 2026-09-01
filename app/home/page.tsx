"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  SproutIcon,
  CloudRainIcon,
  LandmarkIcon,
  StethoscopeIcon,
  ShoppingBasketIcon,
  FlameIcon,
  DropletIcon,
  ClipboardListIcon,
  BookOpenIcon,
  TrendingUpIcon,
  MessageCircleIcon,
  CalendarDaysIcon,
  ThermometerIcon,
  WindIcon,
  ArrowRightIcon,
  AwardIcon,
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { useSensors } from "@/hooks/useSensors"
import { greetingFor } from "@/lib/dialect"
import { hasOnboarded, totalNetProfit } from "@/lib/profile"
import { levelFor, nextLevel, BADGES } from "@/lib/gamification"
import { AgentDock, type AgentBadge } from "@/components/ui/agent-dock"
import { StatWidget } from "@/components/ui/stat-widget"
import { HealthBar } from "@/components/ui/health-bar"
import { ShimmerLoader } from "@/components/ui/shimmer-loader"

const AGENT_ICONS: Record<string, typeof SproutIcon> = {
  sprout: SproutIcon,
  "cloud-rain": CloudRainIcon,
  landmark: LandmarkIcon,
  stethoscope: StethoscopeIcon,
  "shopping-basket": ShoppingBasketIcon,
}

type ApiAgent = {
  id: string
  name: string
  role: string
  tagline: string
  color: string
  iconKey: string
}

export default function HomePage() {
  const router = useRouter()
  const { profile, loaded } = useProfile()
  const { readings } = useSensors(!!profile.has_sensors)

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) {
      router.replace("/login")
    }
  }, [loaded, profile, router])

  // Static agent list mirrors backend — avoids a second fetch on first paint.
  const agents: ApiAgent[] = useMemo(
    () => [
      { id: "steward", name: "Steward", role: "General farm advisor", tagline: "Your everyday farm companion.", color: "#15803d", iconKey: "sprout" },
      { id: "weather", name: "Weather Ken", role: "Weather & spray", tagline: "Frost, rain, wind.", color: "#2563eb", iconKey: "cloud-rain" },
      { id: "grants", name: "Grant Advisor", role: "Schemes & funding", tagline: "SFI, CS, deadlines.", color: "#7c3aed", iconKey: "landmark" },
      { id: "soil", name: "Soil Doctor", role: "Soil, nutrients & water", tagline: "Reads your sensors.", color: "#78716c", iconKey: "sprout" },
      { id: "vet_bridge", name: "Vet Bridge", role: "Livestock signposter", tagline: "Guides you to a vet.", color: "#d97706", iconKey: "stethoscope" },
      { id: "market", name: "Market Guide", role: "Selling direct", tagline: "Box schemes, margins.", color: "#b45309", iconKey: "shopping-basket" },
    ],
    [],
  )

  const agentBadges: AgentBadge[] = useMemo(
    () => agents.map((a) => ({ ...a, icon: AGENT_ICONS[a.iconKey] || SproutIcon })),
    [agents],
  )

  const next = nextLevel(profile.points)
  const level = levelFor(profile.points)
  const profitTotal = totalNetProfit(profile.profit_entries)
  const farmHealth = computeFarmHealth(profile.streak, profile.turns, profile.badges.length, readings?.soil_moisture)

  if (!loaded || !hasOnboarded(profile)) {
    return (
      <main className="screen">
        <div className="card"><ShimmerLoader lines={4} /></div>
        <div className="card"><ShimmerLoader lines={3} /></div>
      </main>
    )
  }

  const greeting = greetingFor(profile.accent, profile.name)

  return (
    <main className="screen">
      {/* Cinematic welcome hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2"
      >
        <p className="sec">Welcome back</p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{greeting}.</h1>
        <p className="text-[color:var(--muted)]">
          {level}
          {next && (<> · {next.needed} pts to {next.name}</>)}
          {profile.streak > 0 && (
            <> · <FlameIcon className="inline text-[color:var(--amber-500)] -mt-0.5" size={14} aria-hidden /> {profile.streak}-day streak</>
          )}
        </p>
      </motion.section>

      {/* Farm health bar (gamification) */}
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

      {/* Talk to your agents */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-baseline justify-between">
          <p className="sec !mb-0 flex items-center gap-1"><MessageCircleIcon size={12} aria-hidden /> Talk to an agent</p>
          <Link href="/agents" className="text-xs text-[color:var(--green-700)] font-semibold flex items-center gap-1">
            See all <ArrowRightIcon size={12} aria-hidden />
          </Link>
        </div>
        <AgentDock
          agents={agentBadges}
          activeId={profile.agent_preference}
          onSelect={(id) => router.push(`/agents/${id}`)}
        />
      </motion.section>

      {/* Quick stats grid */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatWidget
          icon={ClipboardListIcon}
          label="Today's plan"
          value={profile.completed_dates.includes(new Date().toISOString().slice(0, 10)) ? "On track" : "Open"}
          tone={profile.completed_dates.includes(new Date().toISOString().slice(0, 10)) ? "green" : "amber"}
          onClick={() => router.push("/todos")}
        />
        <StatWidget
          icon={CalendarDaysIcon}
          label="Events this week"
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

      {/* Live sensor mini-strip */}
      {profile.has_sensors && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card flex flex-col gap-3"
        >
          <div className="flex items-baseline justify-between">
            <p className="sec !mb-0 flex items-center gap-1"><DropletIcon size={12} aria-hidden /> Live from the farm</p>
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

      {/* Learn CTA */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
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
              {profile.lesson_done.length}/8 lessons · {profile.quiz_done.length}/6 quizzes
            </p>
          </div>
          <ArrowRightIcon size={16} className="text-[color:var(--muted)]" aria-hidden />
        </Link>
      </motion.section>
    </main>
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
