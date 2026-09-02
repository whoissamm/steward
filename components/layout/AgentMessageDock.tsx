"use client"

import { useEffect, useState } from "react"
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
  { id: "steward",    name: "Joseph",  role: "Your everyday companion", color: "#15803d", Icon: SproutIcon },
  { id: "weather",    name: "Ken",     role: "Weather & spray",         color: "#0284c7", Icon: CloudSunRainIcon },
  { id: "grants",     name: "Grace",   role: "Schemes & grants",        color: "#7c3aed", Icon: LandmarkIcon },
  { id: "soil",       name: "Tom",     role: "Soil doctor",             color: "#a16207", Icon: WheatIcon },
  { id: "vet_bridge", name: "Beth",    role: "Vet bridge",              color: "#dc2626", Icon: StethoscopeIcon },
  { id: "market",     name: "Kim",     role: "Selling & markets",       color: "#ea580c", Icon: StoreIcon },
]

/**
 * Positions responsively:
 * - Mobile (<sm): sits at TOP of viewport, since the bottom is taken by BottomNav.
 * - Desktop (≥sm): sits at BOTTOM (thumb-reach) since TopNav owns the top.
 */
export function AgentMessageDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loaded, update } = useProfile()
  // Default to bottom (SSR / wide screens); switches to top on mobile after mount.
  const [position, setPosition] = useState<"top" | "bottom">("bottom")

  useEffect(() => {
    if (typeof window === "undefined") return
    const m = window.matchMedia("(max-width: 639px)")
    const update = () => setPosition(m.matches ? "top" : "bottom")
    update()
    m.addEventListener("change", update)
    return () => m.removeEventListener("change", update)
  }, [])

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
      position={position}
      onSelect={(a) => {
        if (a.id !== profile.agent_preference) {
          update({ agent_preference: a.id })
        }
      }}
      onSend={(message, agent) => {
        router.push(`/agents/${agent.id}?q=${encodeURIComponent(message)}`)
      }}
      placeholder={(name) => `Message ${name}…`}
    />
  )
}
