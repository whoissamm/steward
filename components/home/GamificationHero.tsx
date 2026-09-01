"use client"

import { BADGES, LEVELS, ALL_BADGE_IDS, nextLevel } from "@/lib/gamification"
import { FlameIcon, StarIcon } from "lucide-react"

export function GamificationHero({
  greeting,
  points,
  level,
  streak,
  badges,
}: {
  greeting: string
  points: number
  level: string
  streak: number
  badges: string[]
}) {
  const next = nextLevel(points)
  const ringProgress = next ? next.progress : 1
  const CIRC = 2 * Math.PI * 34

  return (
    <section className="card flex flex-col gap-4" aria-label="Your progress">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0" aria-hidden>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" stroke="var(--border)" strokeWidth="6" fill="none" />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="var(--green-600)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - ringProgress)}
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dashoffset 500ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-lg font-bold leading-none tabular-nums">{points}</span>
            <span className="text-[10px] text-[color:var(--muted)] leading-none">pts</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{greeting}</h1>
          <p className="text-sm text-[color:var(--muted)]">
            Level: <span className="font-semibold text-[color:var(--green-700)]">{level}</span>
            {next && <> · {next.needed} pts to {next.name}</>}
          </p>
          {streak > 0 && (
            <p className="text-sm flex items-center gap-1">
              <FlameIcon size={14} className="text-[color:var(--amber-500)]" aria-hidden />
              <span className="font-semibold">{streak}-day streak</span>
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="sec mb-2">Badges ({badges.length}/{ALL_BADGE_IDS.length})</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ALL_BADGE_IDS.map((id) => {
            const b = BADGES[id]
            const earned = badges.includes(id)
            return (
              <div
                key={id}
                className="flex flex-col items-center gap-1.5 text-center"
                title={`${b.name}: ${b.description}`}
              >
                <div
                  className={
                    "w-11 h-11 rounded-full flex items-center justify-center text-xl transition " +
                    (earned
                      ? "bg-[color:var(--amber-100)] border-2 border-[color:var(--amber-400)]"
                      : "bg-[color:var(--surface-alt)] opacity-40 grayscale border border-[color:var(--border)]")
                  }
                >
                  <span aria-hidden>{b.icon}</span>
                  <span className="sr-only">
                    {b.name}: {earned ? "earned" : "not yet earned"}
                  </span>
                </div>
                <span className="text-[11px] leading-tight">
                  {earned && (
                    <StarIcon
                      size={10}
                      className="inline text-[color:var(--amber-500)] mr-0.5"
                      aria-hidden
                    />
                  )}
                  {b.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
