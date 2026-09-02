"use client"

import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"

/**
 * template.tsx re-mounts on every route change (unlike layout.tsx which persists),
 * so wrapping children in a motion.div here gives us free page transitions.
 * We keep it very light — a soft fade + tiny slide — so it feels calm, not flashy.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  )
}
