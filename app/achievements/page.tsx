"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded } from "@/lib/profile"
import { BADGES, ALL_BADGE_IDS, LEVELS, levelFor, nextLevel } from "@/lib/gamification"
import { AchievementCard } from "@/components/ui/achievement-card"
import { StreakCalendar } from "@/components/ui/streak-calendar"
import { ProgressCard } from "@/components/ui/progress-card"
import { HealthBar } from "@/components/ui/health-bar"
import {
  FlameIcon, StarIcon, ShieldIcon, MicIcon, DatabaseIcon,
  ShoppingBasketIcon, SproutIcon, TrophyIcon, type LucideIcon,
} from "lucide-react"

const BADGE_ICONS: Record<string, LucideIcon> = {
  curious: SproutIcon,
  data: DatabaseIcon,
  careful: ShieldIcon,
  market: ShoppingBasketIcon,
  voice: MicIcon,
  scholar: StarIcon,
}

export default function AchievementsPage() {
  const router = useRouter()
  const { profile, loaded } = useProfile()

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) router.replace("/login")
  }, [loaded, profile, router])

  if (!loaded) {
    return <main className="screen"><p className="text-sm text-[color:var(--muted)]">Loading…</p></main>
  }

  const level = levelFor(profile.points)
  const next = nextLevel(profile.points)
  const earnedCount = profile.badges.length

  return (
    <main className="screen">
      <header className="flex flex-col gap-1">
        <p className="sec">Achievements</p>
        <h1 className="text-2xl font-bold">{level}</h1>
        <p className="text-[color:var(--muted)]">
          {profile.points} pts · {earnedCount}/{ALL_BADGE_IDS.length} badges · <FlameIcon size={12} className="inline text-[color:var(--amber-500)]" aria-hidden /> {profile.streak}-day streak
        </p>
      </header>

      <ProgressCard
        title="Progress to next level"
        value={profile.points}
        target={next ? profile.points + next.needed : profile.points}
        unit="pts"
        description={next ? `${next.needed} pts to ${next.name}` : "You’re a Master Steward — top level unlocked."}
        icon={<TrophyIcon size={16} className="text-[color:var(--amber-500)]" aria-hidden />}
      />

      <div className="card flex flex-col gap-3">
        <HealthBar label="Level path" value={profile.points} max={LEVELS[LEVELS.length - 1][0]} tone="green" segments={LEVELS.length * 5} />
        <div className="grid grid-cols-4 gap-1 text-[10px] text-[color:var(--muted)] font-semibold">
          {LEVELS.map(([_, name]) => (
            <span key={name} className="text-center leading-tight">{name}</span>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <p className="sec">Streak calendar</p>
        <StreakCalendar completedDates={profile.completed_dates} year={new Date().getFullYear()} />
      </section>

      <section className="flex flex-col gap-3">
        <p className="sec">Badges</p>
        <div className="grid gap-3">
          {ALL_BADGE_IDS.map((id) => {
            const b = BADGES[id]
            const earned = profile.badges.includes(id)
            const Icon = BADGE_ICONS[id] || StarIcon
            return (
              <AchievementCard
                key={id}
                name={b.name}
                description={b.description}
                icon={Icon}
                earned={earned}
              />
            )
          })}
        </div>
      </section>
    </main>
  )
}
