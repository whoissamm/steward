"use client"

import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Ambient background. Cheap on mobile:
 *  - Blobs use transform-only animation (translate/scale) → GPU compositor
 *  - Blur radii scaled down on narrow viewports (mobile paint is the enemy)
 *  - `will-change: transform` promotes each blob to its own layer
 *  - No `filter: blur()` animation — the blur is fixed, only transform changes
 */
export function VerdantSwirl({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const smoothY = useSpring(scrollY, { stiffness: 60, damping: 20, mass: 0.6 })
  const y1 = useTransform(smoothY, [0, 800], reduced ? [0, 0] : [0, -60])
  const y2 = useTransform(smoothY, [0, 800], reduced ? [0, 0] : [0, -30])
  const y3 = useTransform(smoothY, [0, 800], reduced ? [0, 0] : [0, 45])

  return (
    <div
      className={cn("fixed inset-0 pointer-events-none overflow-hidden", className)}
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* Static base wash — cheap radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 5%, color-mix(in oklab, var(--green-500) 18%, transparent) 0%, transparent 55%), " +
            "radial-gradient(ellipse at 90% 90%, color-mix(in oklab, var(--amber-400) 15%, transparent) 0%, transparent 60%), " +
            "radial-gradient(ellipse at 55% 45%, color-mix(in oklab, var(--green-700) 9%, transparent) 0%, transparent 50%)",
          opacity: intensity,
        }}
      />

      {/* Blob 1 — top-left green (translate only, GPU-safe) */}
      <motion.div
        className="absolute rounded-full blur-blob blob-1"
        style={{ y: y1, opacity: 0.55 * intensity }}
        animate={reduced ? undefined : { x: [0, 40, -20, 15, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blob 2 — bottom-right amber */}
      <motion.div
        className="absolute rounded-full blur-blob blob-2"
        style={{ y: y2, opacity: 0.5 * intensity }}
        animate={reduced ? undefined : { x: [0, -35, 20, -8, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Blob 3 — centre deep green (only drifts with scroll, no idle wobble) */}
      <motion.div
        className="absolute rounded-full blur-blob blob-3"
        style={{ y: y3, opacity: 0.45 * intensity }}
      />

      <style>{`
        .blur-blob {
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          contain: layout style paint;
        }
        .blob-1 {
          top: -10%; left: -10%;
          width: 60vw; height: 60vw; max-width: 720px; max-height: 720px;
          background: radial-gradient(circle, color-mix(in oklab, var(--green-500) 55%, transparent) 0%, transparent 62%);
          filter: blur(48px);
        }
        .blob-2 {
          bottom: -15%; right: -12%;
          width: 55vw; height: 55vw; max-width: 680px; max-height: 680px;
          background: radial-gradient(circle, color-mix(in oklab, var(--amber-400) 60%, transparent) 0%, transparent 62%);
          filter: blur(52px);
        }
        .blob-3 {
          top: 40%; left: 50%;
          width: 45vw; height: 45vw; max-width: 580px; max-height: 580px;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, color-mix(in oklab, var(--green-700) 40%, transparent) 0%, transparent 68%);
          filter: blur(58px);
        }
        @media (min-width: 900px) {
          .blob-1 { filter: blur(64px); }
          .blob-2 { filter: blur(70px); }
          .blob-3 { filter: blur(76px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .blur-blob { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  )
}
