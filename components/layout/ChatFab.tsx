"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircleIcon, SparklesIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded } from "@/lib/profile"

const HIDE_ON = ["/", "/login", "/onboard", "/agents/"]

export function ChatFab() {
  const pathname = usePathname()
  const { profile, loaded } = useProfile()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Delay reveal slightly so it doesn't fight the page's own reveal animations
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [pathname])

  if (!pathname) return null
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/") || (p.endsWith("/") && pathname.startsWith(p)))) return null
  if (!loaded || !hasOnboarded(profile)) return null

  const agent = profile.agent_preference || "steward"

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed z-40"
          style={{
            right: 16,
            bottom: `calc(env(safe-area-inset-bottom, 0px) + 96px)`,
          }}
        >
          <Link
            href={`/agents/${agent}`}
            aria-label="Ask Steward"
            className="group flex items-center gap-2 pl-3 pr-4 h-12 rounded-full bg-[color:var(--green-700)] text-white shadow-2xl hover:bg-[color:var(--green-800)]"
            style={{ boxShadow: "0 10px 30px color-mix(in oklab, var(--green-600) 40%, transparent)" }}
          >
            <span className="relative w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <MessageCircleIcon size={16} aria-hidden />
              <SparklesIcon size={9} className="absolute -top-0.5 -right-0.5 text-[color:var(--amber-300)]" aria-hidden />
            </span>
            <span className="text-sm font-semibold hidden sm:inline">Ask Steward</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
