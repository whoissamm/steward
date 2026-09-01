"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Ambient background: soft green + amber gradient blobs slowly drifting.
 * Mounted at layout level. Not clickable, respects reduced motion.
 * Uses `position: fixed; inset: 0` and lives beneath body via z-index: 0
 * (body itself is transparent + z-index: 1 in globals.css).
 */
export function VerdantSwirl({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const reduced = useReducedMotion()
  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden",
        className,
      )}
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* Base gradient wash — ensures visible warmth even before blobs animate */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, color-mix(in oklab, var(--green-500) 12%, transparent) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 80% 90%, color-mix(in oklab, var(--amber-400) 12%, transparent) 0%, transparent 55%), " +
            "radial-gradient(ellipse at 60% 40%, color-mix(in oklab, var(--green-700) 6%, transparent) 0%, transparent 45%)",
          opacity: intensity,
        }}
      />

      {/* Drifting blob 1 — green */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: "-10%",
          left: "-10%",
          width: "70vw",
          height: "70vw",
          maxWidth: 800,
          maxHeight: 800,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--green-500) 40%, transparent) 0%, transparent 60%)",
          filter: "blur(60px)",
          opacity: 0.55 * intensity,
        }}
        animate={reduced ? undefined : { x: [0, 40, -20, 0], y: [0, 30, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Drifting blob 2 — amber */}
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: "-15%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          maxWidth: 700,
          maxHeight: 700,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--amber-400) 45%, transparent) 0%, transparent 60%)",
          filter: "blur(70px)",
          opacity: 0.5 * intensity,
        }}
        animate={reduced ? undefined : { x: [0, -30, 20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Drifting blob 3 — deep green */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: "40%",
          left: "50%",
          width: "50vw",
          height: "50vw",
          maxWidth: 600,
          maxHeight: 600,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--green-700) 30%, transparent) 0%, transparent 65%)",
          filter: "blur(80px)",
          opacity: 0.45 * intensity,
          transform: "translate(-50%, -50%)",
        }}
        animate={reduced ? undefined : { scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

/**
 * Grain overlay — very subtle noise, gives the bg a cinematic film look.
 */
export function FilmGrain({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none mix-blend-overlay"
      style={{
        zIndex: 0,
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
      }}
      aria-hidden
    />
  )
}
