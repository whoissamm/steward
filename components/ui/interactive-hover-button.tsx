"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InteractiveHoverButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode
}

export function InteractiveHoverButton({
  children = "Get started",
  className,
  ...props
}: InteractiveHoverButtonProps) {
  return (
    <motion.button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden",
        "rounded-full px-6 py-2.5 font-medium text-sm",
        "border border-border bg-background text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "cursor-pointer select-none",
        className
      )}
      whileHover="hovered"
      whileFocus="hovered"
      initial="idle"
      {...props}
    >
      {/* Fill layer sliding from left */}
      <motion.span
        className="absolute inset-0 bg-foreground origin-left"
        variants={{
          idle: { scaleX: 0 },
          hovered: { scaleX: 1 },
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        aria-hidden
      />

      {/* Label */}
      <motion.span
        className="relative z-10 transition-colors duration-200"
        variants={{
          idle: { color: "var(--foreground, inherit)" },
          hovered: { color: "var(--background, #fff)" },
        }}
      >
        {children}
      </motion.span>

      {/* Arrow icon */}
      <motion.span
        className="relative z-10 ml-2 flex items-center"
        variants={{
          idle: { x: 8, opacity: 0 },
          hovered: { x: 0, opacity: 1 },
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        aria-hidden
      >
        <motion.span
          variants={{
            idle: { color: "var(--foreground, inherit)" },
            hovered: { color: "var(--background, #fff)" },
          }}
        >
          <ArrowRight className="w-4 h-4" />
        </motion.span>
      </motion.span>
    </motion.button>
  )
}
