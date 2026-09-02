"use client"

import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"

/**
 * template.tsx re-mounts on every route change, giving us free page transitions.
 * Transform + opacity only — no scale (causes child reflow) and no filter
 * (blur() is painful on mobile). Pure GPU compositor path.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col"
      style={{ willChange: reduced ? undefined : "transform, opacity" }}
    >
      {children}
    </motion.div>
  )
}
