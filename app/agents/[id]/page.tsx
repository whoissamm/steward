"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { AgentChat } from "@/components/ask/AgentChat"
import { AGENT_ICON_MAP, JosephIcon } from "@/components/ui/agent-icons"
import { nameForAgent, type AgentId } from "@/lib/agent-names"
import { useProfile } from "@/hooks/useProfile"

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

function AgentPageInner() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const q = search.get("q") || undefined
  const id = (params?.id ?? "steward") as AgentId
  const { profile } = useProfile()
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
        if (!cancelled) {
          setAgent({
            id,
            name: "Steward",
            role: "General farm advisor",
            tagline: "Your everyday farm companion.",
            color: "#166534",
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

  const Icon = useMemo(() => AGENT_ICON_MAP[id] || JosephIcon, [id])
  const gender = profile.voice_gender ?? "male"
  const resolvedName = nameForAgent(id, gender)

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
        <Icon size={48} />
        <div className="flex flex-col min-w-0">
          <p className="text-xs text-[color:var(--muted)] font-semibold uppercase tracking-wider">
            {agent.role}
          </p>
          <h1 className="text-lg font-bold leading-tight">{resolvedName}</h1>
        </div>
      </header>

      <AgentChat
        agentId={agent.id}
        agentName={resolvedName}
        agentColor={agent.color}
        greeting={agent.greeting.replace(agent.name, resolvedName)}
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
