"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/useProfile"
import { greetingFor } from "@/lib/dialect"
import { hasOnboarded } from "@/lib/profile"
import { levelFor } from "@/lib/gamification"
import { GamificationHero } from "@/components/home/GamificationHero"
import { DailyPlan } from "@/components/home/DailyPlan"
import { SensorPanel } from "@/components/home/SensorPanel"
import { useRouter as _r } from "next/navigation"
import { SparklesIcon } from "lucide-react"

const SUGGESTIONS = [
  "Do I need to irrigate today?",
  "Can I still apply for the SFI scheme?",
  "How can AI cut my fertiliser costs?",
  "How do I improve my soil health?",
  "How does rotational grazing help?",
]

function HomeSkeleton() {
  return (
    <main className="screen">
      <div className="card flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-4 w-56" />
          </div>
        </div>
        <div className="skeleton h-14 w-full" />
      </div>
      <div className="card flex flex-col gap-3">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
      </div>
    </main>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { profile, loaded, update } = useProfile()

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) {
      router.replace("/onboard")
    }
  }, [loaded, profile, router])

  if (!loaded) return <HomeSkeleton />
  if (!hasOnboarded(profile)) return <HomeSkeleton />

  const greeting = greetingFor(profile.accent, profile.name)

  function askQuestion(q: string) {
    const params = new URLSearchParams({ q })
    router.push(`/ask?${params.toString()}`)
  }

  return (
    <main className="screen">
      <GamificationHero
        greeting={greeting}
        points={profile.points}
        level={levelFor(profile.points)}
        streak={profile.streak}
        badges={profile.badges}
      />

      <DailyPlan
        profile={profile}
        onProgress={({ total_points, new_badges }) =>
          update({
            points: total_points,
            badges: Array.from(new Set([...profile.badges, ...new_badges])),
          })
        }
      />

      {profile.has_sensors && <SensorPanel />}

      <section aria-label="Suggested questions" className="flex flex-col gap-2">
        <p className="sec flex items-center gap-1">
          <SparklesIcon size={12} aria-hidden /> Try asking
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => askQuestion(s)}
              className="chip chip-outline hover:bg-[color:var(--amber-50)] hover:border-[color:var(--amber-400)] transition cursor-pointer px-3 py-2 text-left"
            >
              {s}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
