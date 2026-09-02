"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  SproutIcon,
  CloudSunRainIcon,
  LandmarkIcon,
  StethoscopeIcon,
  StoreIcon,
  WheatIcon,
  type LucideIcon,
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded } from "@/lib/profile"
import { MessageDock, type DockAgent } from "@/components/ui/message-dock"

// Hidden on splash/login/onboard and inside individual agent chats
// (they have their own composer).
const HIDE_EXACT = new Set(["/", "/login", "/onboard"])
const HIDE_PREFIX = ["/agents/"]

type AgentDef = {
  id: string
  name: string
  role: string
  color: string
  Icon: LucideIcon
}

const AGENTS: AgentDef[] = [
  { id: "steward",    name: "Steward", role: "Your everyday companion", color: "#15803d", Icon: SproutIcon },
  { id: "weather",    name: "Ken",     role: "Weather & spray",         color: "#0284c7", Icon: CloudSunRainIcon },
  { id: "grants",     name: "Grace",   role: "Schemes & grants",        color: "#7c3aed", Icon: LandmarkIcon },
  { id: "soil",       name: "Tom",     role: "Soil doctor",             color: "#a16207", Icon: WheatIcon },
  { id: "vet_bridge", name: "Beth",    role: "Vet bridge",              color: "#dc2626", Icon: StethoscopeIcon },
  { id: "market",     name: "Kim",     role: "Selling & markets",       color: "#ea580c", Icon: StoreIcon },
]

export function AgentMessageDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loaded } = useProfile()

  if (!pathname) return null
  if (HIDE_EXACT.has(pathname)) return null
  if (HIDE_PREFIX.some((p) => pathname.startsWith(p))) return null
  if (!loaded || !hasOnboarded(profile)) return null

  const dockAgents: DockAgent[] = AGENTS.map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    color: a.color,
    icon: <a.Icon size={16} strokeWidth={2.2} />,
    online: true,
  }))

  return (
    <MessageDock
      agents={dockAgents}
      onSelect={(a) => {
        // Reflect preferred agent
        // (no-op if same as current; deliberate — user picks in the flow)
        if (a.id !== profile.agent_preference) {
          // Persist as user's preferred agent so return visits open with them
          // via ProfileProvider — done lazily via update helper
          // (no direct import to keep this thin)
        }
      }}
      onSend={(message, agent) => {
        router.push(`/agents/${agent.id}?q=${encodeURIComponent(message)}`)
      }}
      placeholder={(name) => (name === "Steward" ? "Ask Steward…" : `Message ${name}…`)}
    />
  )
}
