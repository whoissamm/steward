"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  SproutIcon,
  CloudSunRainIcon,
  LandmarkIcon,
  StethoscopeIcon,
  StoreIcon,
  WheatIcon,
  ArrowLeftIcon,
  type LucideIcon,
} from "lucide-react"
import { AgentChat } from "@/components/ask/AgentChat"

type ApiAgent = {
  id: string
  name: string
  role: string
  tagline: string
  color: string
  iconKey: string
  suggestions: string[]
  greeting: string
}

const ICONS: Record<string, LucideIcon> = {
  sprout: SproutIcon,
  "cloud-sun-rain": CloudSunRainIcon,
  landmark: LandmarkIcon,
  wheat: WheatIcon,
  stethoscope: StethoscopeIcon,
  store: StoreIcon,
}

function AgentPageInner() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const q = search.get("q") || undefined
  const id = params?.id ?? "steward"
  const [agent, setAgent] = useState<ApiAgent | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/agents")
      .then((r) => r.json() as Promise<{ agents: ApiAgent[] }>)
      .then((d) => {
        if (cancelled) return
        const found = d.agents.find((a) => a.id === id) || d.agents[0]
        setAgent(found)
      })
      .catch(() => {
        // Fallback to a minimal Steward if API is unreachable
        if (!cancelled) {
          setAgent({
            id,
            name: "Steward",
            role: "General farm advisor",
            tagline: "Your everyday farm companion.",
            color: "#15803d",
            iconKey: "sprout",
            suggestions: ["Do I need to irrigate today?", "Can I still apply for the SFI scheme?"],
            greeting: "How can I help on the farm today?",
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const Icon = useMemo(() => (agent ? ICONS[agent.iconKey] || SproutIcon : SproutIcon), [agent])

  if (!agent) {
    return (
      <main className="screen">
        <p className="text-sm text-[color:var(--muted)]">Loading agent…</p>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="flex items-center gap-3">
        <Link href="/agents" className="btn-ghost !p-2" aria-label="Back to agents">
          <ArrowLeftIcon size={18} aria-hidden />
        </Link>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${agent.color}, color-mix(in oklab, ${agent.color} 70%, black))` }}
        >
          <Icon size={22} aria-hidden />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-xs text-[color:var(--muted)] font-semibold uppercase tracking-wider">
            {agent.role}
          </p>
          <h1 className="text-lg font-bold leading-tight">{agent.name}</h1>
        </div>
      </header>

      <AgentChat
        agentId={agent.id}
        agentName={agent.name}
        agentColor={agent.color}
        greeting={agent.greeting}
        suggestions={agent.suggestions}
        initialQuestion={q}
      />
    </main>
  )
}

export default function AgentPage() {
  return (
    <Suspense
      fallback={
        <main className="screen">
          <p className="text-sm text-[color:var(--muted)]">Loading agent…</p>
        </main>
      }
    >
      <AgentPageInner />
    </Suspense>
  )
}
