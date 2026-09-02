"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  SproutIcon,
  CloudRainIcon,
  LandmarkIcon,
  StethoscopeIcon,
  ShoppingBasketIcon,
  ChevronUpIcon,
  MessageCircleIcon,
  type LucideIcon,
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded } from "@/lib/profile"
import { cn } from "@/lib/utils"

// Message-dock pattern: a horizontal strip of agent avatars pinned above the
// bottom nav. Tap an avatar → jump to that agent's chat. Tap the chevron to
// collapse into a single "Ask an agent" pill.
// Hidden on splash/login/onboard, on /home (user directive: no AI bots on home),
// and on chat pages (agents live there already).

// Home CAN show the floating dock (per product decision) — just no in-page
// agent picker section. Dock stays hidden on splash/login/onboard/chat pages.
const HIDE_EXACT = new Set(["/", "/login", "/onboard"])
const HIDE_PREFIX = ["/agents/"]

type Agent = { id: string; name: string; role: string; color: string; Icon: LucideIcon }

const AGENTS: Agent[] = [
  { id: "steward",    name: "Steward",       role: "General",   color: "#15803d", Icon: SproutIcon },
  { id: "weather",    name: "Weather Ken",   role: "Weather",   color: "#2563eb", Icon: CloudRainIcon },
  { id: "grants",     name: "Grant Advisor", role: "Schemes",   color: "#7c3aed", Icon: LandmarkIcon },
  { id: "soil",       name: "Soil Doctor",   role: "Soil",      color: "#78716c", Icon: SproutIcon },
  { id: "vet_bridge", name: "Vet Bridge",    role: "Livestock", color: "#d97706", Icon: StethoscopeIcon },
  { id: "market",     name: "Market Guide",  role: "Selling",   color: "#b45309", Icon: ShoppingBasketIcon },
]

const STORAGE_KEY = "steward.agent-dock.collapsed"

export function AgentMessageDock() {
  const pathname = usePathname()
  const { profile, loaded } = useProfile()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1")
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
  }, [collapsed])

  if (!pathname) return null
  if (HIDE_EXACT.has(pathname)) return null
  if (HIDE_PREFIX.some((p) => pathname.startsWith(p))) return null
  if (!loaded || !hasOnboarded(profile)) return null

  const preferred = profile.agent_preference || "steward"

  return (
    <div
      className="fixed left-0 right-0 z-40 pointer-events-none px-3"
      style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + 92px)` }}
    >
      <div className="mx-auto max-w-3xl flex justify-end sm:justify-center pointer-events-auto">
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.button
              key="collapsed"
              type="button"
              onClick={() => setCollapsed(false)}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="flex items-center gap-2 pl-3 pr-4 h-11 rounded-full bg-[color:var(--surface)]/95 backdrop-blur-md border border-[color:var(--border)] shadow-2xl text-sm font-semibold"
              aria-label="Show agents"
            >
              <MessageCircleIcon size={14} className="text-[color:var(--green-700)]" aria-hidden />
              Ask an agent
            </motion.button>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="flex items-center gap-1.5 p-2 pr-1 rounded-2xl bg-[color:var(--surface)]/95 backdrop-blur-md border border-[color:var(--border)] shadow-2xl"
              role="tablist"
              aria-label="AI agents"
            >
              {AGENTS.map((a) => {
                const active = a.id === preferred
                const Icon = a.Icon
                return (
                  <Link
                    key={a.id}
                    href={`/agents/${a.id}`}
                    aria-label={`${a.name} — ${a.role}`}
                    className={cn(
                      "relative w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110",
                      active && "ring-2 ring-offset-2 ring-offset-[color:var(--surface)]",
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${a.color}, color-mix(in oklab, ${a.color} 70%, black))`,
                      ...(active ? ({ boxShadow: `0 0 0 2px ${a.color}` } as React.CSSProperties) : {}),
                    }}
                  >
                    <Icon size={16} className="text-white" aria-hidden strokeWidth={2.2} />
                  </Link>
                )
              })}
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="ml-1 w-8 h-8 rounded-lg flex items-center justify-center text-[color:var(--muted)] hover:bg-[color:var(--surface-alt)]"
                aria-label="Hide agents dock"
              >
                <ChevronUpIcon size={14} className="rotate-180" aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
