"use client"

import { useRouter, usePathname } from "next/navigation"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded } from "@/lib/profile"
import { nameForAgent, type AgentId } from "@/lib/agent-names"
import { AGENT_ICON_MAP } from "@/components/ui/agent-icons"
import { MessageDock, type DockAgent } from "@/components/ui/message-dock"

const HIDE_EXACT = new Set(["/", "/login", "/onboard"])
const HIDE_PREFIX = ["/agents/"]

type AgentDef = { id: AgentId; role: string; color: string }

const AGENTS: AgentDef[] = [
  { id: "steward",    role: "Your everyday companion", color: "#166534" },
  { id: "weather",    role: "Weather & spray",         color: "#0369a1" },
  { id: "grants",     role: "Schemes & grants",        color: "#6d28d9" },
  { id: "soil",       role: "Soil doctor",             color: "#78350f" },
  { id: "vet_bridge", role: "Vet bridge",              color: "#b91c1c" },
  { id: "market",     role: "Selling & markets",       color: "#c2410c" },
]

export function AgentMessageDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loaded, update } = useProfile()

  if (!pathname) return null
  if (HIDE_EXACT.has(pathname)) return null
  if (HIDE_PREFIX.some((p) => pathname.startsWith(p))) return null
  if (!loaded || !hasOnboarded(profile)) return null

  const gender = profile.voice_gender ?? "male"

  const dockAgents: DockAgent[] = AGENTS.map((a) => {
    const Icon = AGENT_ICON_MAP[a.id]
    return {
      id: a.id,
      name: nameForAgent(a.id, gender),
      role: a.role,
      color: a.color,
      icon: <Icon size={44} />,
      online: true,
    }
  })

  return (
    <MessageDock
      agents={dockAgents}
      position="bottom"
      onSelect={(a) => {
        if (a.id !== profile.agent_preference) update({ agent_preference: a.id })
      }}
      onSend={(message, agent) => {
        router.push(`/agents/${agent.id}?q=${encodeURIComponent(message)}`)
      }}
      placeholder={(name) => `Message ${name}…`}
    />
  )
}
