"use client"

import { useId, useState, type ReactNode } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { FolderIcon, FolderOpenIcon, CheckIcon, ClockIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Course lesson card styled as a manila folder that opens into a full page.
 * Uses CSS perspective + rotateX on the "tab" for a subtle 3D feel.
 */
export function FolderCard({
  eyebrow,
  title,
  duration,
  done,
  children,
  defaultOpen = false,
  color = "var(--amber-400)",
  className,
}: {
  eyebrow?: string
  title: string
  duration?: string
  done?: boolean
  children: ReactNode
  defaultOpen?: boolean
  color?: string
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  const reduced = useReducedMotion()

  return (
    <motion.article
      layout
      className={cn("relative", className)}
      style={{ perspective: 1200 }}
    >
      {/* Folder tab — visible only when closed */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute -top-2 left-6 h-6 w-24 rounded-t-lg border border-b-0 border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm flex items-center justify-center gap-1"
            style={{ background: `linear-gradient(180deg, ${color} 0%, color-mix(in oklab, ${color} 60%, var(--surface)) 100%)` }}
            aria-hidden
          >
            <FolderIcon size={12} className="text-[color:var(--stone-800)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--stone-800)]">
              Lesson
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={cn(
          "card cursor-pointer relative",
          done && "border-[color:var(--green-700)]",
        )}
        style={done ? { boxShadow: "0 0 0 1px var(--green-700), 0 4px 20px color-mix(in oklab, var(--green-600) 20%, transparent)" } : undefined}
      >
        <button
          type="button"
          className="w-full flex items-start gap-3 text-left"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
        >
          <span
            className={cn(
              "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
              done
                ? "bg-[color:var(--green-700)] text-white"
                : "bg-[color:var(--surface-alt)] text-[color:var(--muted)]",
            )}
          >
            {done ? <CheckIcon size={18} aria-hidden /> : open ? <FolderOpenIcon size={18} aria-hidden /> : <FolderIcon size={18} aria-hidden />}
          </span>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--muted)]">
                {eyebrow}
              </p>
            )}
            <h3 className="font-semibold leading-tight">{title}</h3>
            {duration && (
              <p className="text-xs text-[color:var(--muted)] flex items-center gap-1">
                <ClockIcon size={10} aria-hidden /> {duration}
              </p>
            )}
          </div>
          <motion.span
            animate={{ rotateX: open ? 180 : 0 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 text-[color:var(--muted)]"
            style={{ transformStyle: "preserve-3d" }}
            aria-hidden
          >
            ▾
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-3 border-t border-[color:var(--border)]">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.article>
  )
}
