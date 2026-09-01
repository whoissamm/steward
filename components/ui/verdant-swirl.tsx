"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export function VerdantSwirl({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  return (
    <div
      className={cn("fixed inset-0 -z-10 pointer-events-none overflow-hidden", className)}
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 800 800"
        width="120%"
        height="120%"
        className="absolute -top-16 -left-16 opacity-30"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%">
            <stop offset="0%" stopColor="var(--green-500)" stopOpacity="0.6" />
            <stop offset="60%" stopColor="var(--green-700)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--green-700)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g2" cx="50%" cy="50%">
            <stop offset="0%" stopColor="var(--amber-400)" stopOpacity="0.55" />
            <stop offset="70%" stopColor="var(--amber-500)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--amber-500)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g3" cx="50%" cy="50%">
            <stop offset="0%" stopColor="var(--green-800)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--green-800)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="230" cy="180" r="260" fill="url(#g1)" />
        <circle cx="580" cy="260" r="200" fill="url(#g2)" />
        <circle cx="420" cy="560" r="300" fill="url(#g3)" />
      </motion.svg>
      <motion.svg
        viewBox="0 0 800 800"
        width="120%"
        height="120%"
        className="absolute -bottom-24 -right-24 opacity-25"
        animate={reduced ? undefined : { rotate: -360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="400" cy="400" r="360" fill="url(#g1)" />
        <circle cx="240" cy="620" r="200" fill="url(#g2)" />
      </motion.svg>
    </div>
  )
}
