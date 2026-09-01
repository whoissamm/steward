"use client"

import { useEffect } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { XIcon } from "lucide-react"

export function AchievementUnlocked({
  open,
  onClose,
  name,
  description,
  icon: Icon,
  autoDismissMs = 3800,
}: {
  open: boolean
  onClose: () => void
  name: string
  description: string
  icon: LucideIcon
  autoDismissMs?: number
}) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, autoDismissMs)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose, autoDismissMs])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="assertive"
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-auto"
            onClick={onClose}
            style={{ background: "radial-gradient(circle at center, rgba(0,0,0,0.35), rgba(0,0,0,0.55))" }}
          />
          {!reduced && (
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i / 18) * Math.PI * 2
                const distance = 200 + Math.random() * 120
                return (
                  <motion.span
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                    style={{
                      background: i % 2 === 0 ? "var(--amber-400)" : "var(--green-600)",
                    }}
                    initial={{ x: -4, y: -4, opacity: 1, scale: 0.6 }}
                    animate={{
                      x: -4 + Math.cos(angle) * distance,
                      y: -4 + Math.sin(angle) * distance,
                      opacity: 0,
                      scale: 1.2,
                    }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.02 }}
                  />
                )
              })}
            </div>
          )}
          <motion.div
            role="dialog"
            aria-label={`Achievement unlocked: ${name}`}
            initial={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0, y: 40 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="relative pointer-events-auto card max-w-[320px] flex flex-col items-center text-center gap-3 px-6 py-6 border-2 border-[color:var(--amber-400)]"
            style={{ boxShadow: "0 12px 40px color-mix(in oklab, var(--amber-400) 40%, transparent)" }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss"
              className="btn-ghost absolute top-2 right-2 !p-1"
            >
              <XIcon size={14} aria-hidden />
            </button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--amber-600)]">
              Achievement unlocked
            </p>
            <div className="w-16 h-16 rounded-full bg-[color:var(--amber-100)] text-[color:var(--amber-700)] flex items-center justify-center">
              <Icon size={30} aria-hidden />
            </div>
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="text-sm text-[color:var(--muted)]">{description}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
