"use client"

import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"

/**
 * template.tsx re-mounts on every route change (unlike layout.tsx which persists),
 * giving us free page transitions. Transform + opacity only so it stays smooth
 * on mobile. Slide is deliberately punchy (24px) so it's actually visible on
 * big monitors where the eye picks up less at short distances.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col"
      style={{ willChange: reduced ? undefined : "transform, opacity" }}
    >
      {children}
    </motion.div>
  )
}
