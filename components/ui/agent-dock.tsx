"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type AgentBadge = {
  id: string
  name: string
  role: string
  color: string
  icon: LucideIcon
}

export function AgentDock({
  agents,
  activeId,
  onSelect,
  className,
}: {
  agents: AgentBadge[]
  activeId?: string
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn("flex gap-3 overflow-x-auto scroll-smooth snap-x pb-2", className)} role="tablist" aria-label="Choose an AI agent">
      {agents.map((a) => {
        const active = a.id === activeId
        const Icon = a.icon
        return (
          <div key={a.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 snap-center">
            <motion.button
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`${a.name} — ${a.role}`}
              onClick={() => onSelect(a.id)}
              className={cn(
                "relative w-14 h-14 rounded-full flex items-center justify-center transition-shadow",
                active ? "shadow-lg" : "opacity-75 hover:opacity-100",
              )}
              style={{
                background: `linear-gradient(135deg, ${a.color}, color-mix(in oklab, ${a.color} 70%, black))`,
                boxShadow: active ? `0 0 0 3px ${a.color}, 0 4px 20px color-mix(in oklab, ${a.color} 40%, transparent)` : undefined,
              }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.06 }}
            >
              <Icon size={22} className="text-white" aria-hidden strokeWidth={2.2} />
            </motion.button>
            <span
              className={cn(
                "text-[11px] leading-tight font-semibold text-center max-w-[68px]",
                active ? "text-[color:var(--fg)]" : "text-[color:var(--muted)]",
              )}
            >
              {a.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
