"use client"

import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Ambient background: soft green + amber blobs drifting + scroll-linked parallax.
 * Mounted at layout level. Not clickable, respects reduced motion.
 * Body is transparent + z-index:1 in globals.css so this sits behind everything.
 */
export function VerdantSwirl({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()

  // Blobs drift a little as the user scrolls — subtle parallax gives the whole
  // background a sense of depth without being distracting.
  const smoothY = useSpring(scrollY, { stiffness: 80, damping: 20, mass: 0.5 })
  const y1 = useTransform(smoothY, [0, 800], reduced ? [0, 0] : [0, -80])
  const y2 = useTransform(smoothY, [0, 800], reduced ? [0, 0] : [0, -40])
  const y3 = useTransform(smoothY, [0, 800], reduced ? [0, 0] : [0, 60])

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden",
        className,
      )}
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, color-mix(in oklab, var(--green-500) 15%, transparent) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 80% 90%, color-mix(in oklab, var(--amber-400) 14%, transparent) 0%, transparent 55%), " +
            "radial-gradient(ellipse at 60% 40%, color-mix(in oklab, var(--green-700) 8%, transparent) 0%, transparent 45%)",
          opacity: intensity,
        }}
      />

      {/* Blob 1 — green, upper-left, drifts up with scroll */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: "-10%",
          left: "-10%",
          width: "70vw",
          height: "70vw",
          maxWidth: 900,
          maxHeight: 900,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--green-500) 50%, transparent) 0%, transparent 60%)",
          filter: "blur(60px)",
          opacity: 0.6 * intensity,
          y: y1,
        }}
        animate={reduced ? undefined : { x: [0, 60, -30, 20, 0], scale: [1, 1.08, 0.95, 1.03, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blob 2 — amber, lower-right, small parallax */}
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: "-15%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          maxWidth: 800,
          maxHeight: 800,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--amber-400) 55%, transparent) 0%, transparent 60%)",
          filter: "blur(70px)",
          opacity: 0.55 * intensity,
          y: y2,
        }}
        animate={reduced ? undefined : { x: [0, -50, 30, -10, 0], scale: [1, 1.06, 0.92, 1.04, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Blob 3 — deep green, centre-ish, drifts down with scroll */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: "40%",
          left: "50%",
          width: "50vw",
          height: "50vw",
          maxWidth: 700,
          maxHeight: 700,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--green-700) 35%, transparent) 0%, transparent 65%)",
          filter: "blur(80px)",
          opacity: 0.5 * intensity,
          x: "-50%",
          y: y3,
        }}
        animate={reduced ? undefined : { scale: [1, 1.18, 0.94, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Small sparkle — a tiny amber blob that pulses gently, off-centre.
          Adds life without stealing attention. */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: "15%",
          right: "18%",
          width: "20vw",
          height: "20vw",
          maxWidth: 260,
          maxHeight: 260,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--amber-300) 45%, transparent) 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: 0.4 * intensity,
        }}
        animate={reduced ? undefined : { scale: [1, 1.25, 0.9, 1.1, 1], opacity: [0.4, 0.55, 0.3, 0.5, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </div>
  )
}

export function FilmGrain({ opacity = 0.035 }: { opacity?: number }) {
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
