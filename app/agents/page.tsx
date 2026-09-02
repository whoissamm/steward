"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  SproutIcon,
  CloudSunRainIcon,
  LandmarkIcon,
  StethoscopeIcon,
  StoreIcon,
  WheatIcon,
  ArrowRightIcon,
  type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  sprout: SproutIcon,
  "cloud-sun-rain": CloudSunRainIcon,
  landmark: LandmarkIcon,
  wheat: WheatIcon,
  stethoscope: StethoscopeIcon,
  store: StoreIcon,
}

const AGENTS = [
  { id: "steward",    name: "Joseph",  role: "Your everyday companion", tagline: "The friend who knows your farm — start here.",              color: "#15803d", iconKey: "sprout" },
  { id: "weather",    name: "Ken",     role: "Weather & spray",         tagline: "Frost risk, rain windows, safe spray days.",                color: "#0284c7", iconKey: "cloud-sun-rain" },
  { id: "grants",     name: "Grace",   role: "Schemes & grants",        tagline: "SFI, Countryside Stewardship, deadlines and paperwork.",    color: "#7c3aed", iconKey: "landmark" },
  { id: "soil",       name: "Tom",     role: "Soil doctor",             tagline: "Soil health, nutrients, irrigation, sensors.",              color: "#a16207", iconKey: "wheat" },
  { id: "vet_bridge", name: "Beth",    role: "Vet bridge",              tagline: "Never gives dosing — helps you decide when to call the vet.", color: "#dc2626", iconKey: "stethoscope" },
  { id: "market",     name: "Kim",     role: "Selling & markets",       tagline: "Box schemes, farm shops, added value.",                     color: "#ea580c", iconKey: "store" },
]

export default function AgentsPage() {
  const cards = useMemo(
    () =>
      AGENTS.map((a) => ({ ...a, Icon: ICONS[a.iconKey] || SproutIcon })),
    [],
  )

  return (
    <main className="screen">
      <header className="flex flex-col gap-1">
        <p className="sec">Your farm agents</p>
        <h1 className="text-2xl font-bold">Six specialists, one companion.</h1>
        <p className="text-[color:var(--muted)]">
          Each agent has the same source-cited retrieval — they differ only in what they focus on and how they talk.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {cards.map((a) => {
          const Icon = a.Icon
          return (
            <Link
              key={a.id}
              href={`/agents/${a.id}`}
              className="card flex items-center gap-4 hover:border-[color:var(--green-600)] transition-colors"
            >
              <div
                className="relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${a.color} 40%, white) 0%, ${a.color} 45%, color-mix(in oklab, ${a.color} 60%, black) 100%)`,
                  boxShadow: `inset 0 1px 0 color-mix(in oklab, white 40%, transparent), 0 4px 12px color-mix(in oklab, ${a.color} 40%, transparent)`,
                }}
              >
                <span
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 65% 45% at 30% 20%, rgba(255,255,255,0.32), transparent 70%)" }}
                  aria-hidden
                />
                <Icon size={26} aria-hidden style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.25))" }} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="font-bold">{a.name}</p>
                <p className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wider">
                  {a.role}
                </p>
                <p className="text-sm text-[color:var(--muted)]">{a.tagline}</p>
              </div>
              <ArrowRightIcon size={18} className="text-[color:var(--muted)] flex-shrink-0" aria-hidden />
            </Link>
          )
        })}
      </div>
    </main>
  )
}
