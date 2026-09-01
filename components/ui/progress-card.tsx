"use client"

import { useEffect, useState, type ReactNode } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { cn } from "@/lib/utils"

export function ProgressCard({
  title,
  value,
  target,
  unit,
  description,
  tone = "green",
  icon,
  className,
}: {
  title: string
  value: number
  target: number
  unit?: string
  description?: string
  tone?: "green" | "amber" | "blue"
  icon?: ReactNode
  className?: string
}) {
  const pct = Math.max(0, Math.min(1, value / target))
  const [displayed, setDisplayed] = useState(0)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.9, ease: "easeOut" })
    const unsub = rounded.on("change", (v) => setDisplayed(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [value, count, rounded])

  const fillColor = tone === "green" ? "var(--green-600)" : tone === "amber" ? "var(--amber-500)" : "#3b82f6"

  return (
    <div className={cn("card flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className="text-sm tabular-nums">
          <span className="font-bold">{displayed}</span>
          <span className="text-[color:var(--muted)]"> / {target}{unit ? ` ${unit}` : ""}</span>
        </span>
      </div>
      <div className="xp-track">
        <motion.div
          className="xp-fill"
          style={{ background: `linear-gradient(90deg, var(--amber-400), ${fillColor})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      {description && <p className="text-xs text-[color:var(--muted)]">{description}</p>}
    </div>
  )
}
