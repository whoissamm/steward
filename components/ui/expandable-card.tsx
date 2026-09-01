"use client"

import { useId, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ExpandableCard({
  title,
  subtitle,
  eyebrow,
  icon,
  children,
  defaultOpen = false,
  className,
  rightSlot,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  rightSlot?: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <motion.article layout className={cn("card overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-start gap-3 text-left"
      >
        {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {eyebrow && <p className="sec !mb-0">{eyebrow}</p>}
          <h3 className="text-base font-semibold leading-tight">{title}</h3>
          {subtitle && <p className="text-sm text-[color:var(--muted)] leading-snug">{subtitle}</p>}
        </div>
        {rightSlot}
        <span className="flex-shrink-0 text-[color:var(--muted)] mt-0.5">
          {open ? <ChevronUpIcon size={18} aria-hidden /> : <ChevronDownIcon size={18} aria-hidden />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-3 border-t border-[color:var(--border)]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
