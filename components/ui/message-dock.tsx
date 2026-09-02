"use client"

import { cn } from "@/lib/utils"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect, type ReactNode } from "react"
import { SendIcon, MenuIcon, SparklesIcon } from "lucide-react"

export interface DockAgent {
  id: string
  name: string
  role?: string
  color: string           // primary tint (e.g. "#15803d")
  gradient?: string       // optional "colorA, colorB" for the expanded pill bg
  icon: ReactNode         // lucide icon element already rendered (with size + colour)
  online?: boolean
}

export interface MessageDockProps {
  agents: DockAgent[]
  onSend?: (message: string, agent: DockAgent) => void
  onSelect?: (agent: DockAgent) => void
  onDockToggle?: (isExpanded: boolean) => void
  className?: string
  expandedWidth?: number
  position?: "bottom" | "top"
  placeholder?: (agentName: string) => string
  autoFocus?: boolean
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  closeOnSend?: boolean
}

/**
 * Adapted from Isaiah Bjork's message-dock pattern. Row of agent avatars in a
 * translucent pill; tap one to expand into a message input with the agent's
 * gradient. Send fires onSend(msg, agent).
 */
export function MessageDock({
  agents,
  onSend,
  onSelect,
  onDockToggle,
  className,
  expandedWidth = 460,
  position = "bottom",
  placeholder = (name) => `Message ${name}…`,
  autoFocus = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnSend = true,
}: MessageDockProps) {
  const reduced = useReducedMotion()
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const dockRef = useRef<HTMLDivElement>(null)
  // Sensible default so the pill is visible on first paint (was 0 = invisible
  // if measurement fell through, which broke it on mobile).
  const [collapsedWidth, setCollapsedWidth] = useState<number>(340)
  const [inited, setInited] = useState(false)

  // Refine collapsed width by measurement — safe fallback if it fails
  useEffect(() => {
    if (dockRef.current && !inited) {
      const w = dockRef.current.offsetWidth
      if (w > 0) {
        setCollapsedWidth(w)
        setInited(true)
      }
    }
  }, [inited])

  useEffect(() => {
    if (!closeOnClickOutside) return
    const handler = (ev: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(ev.target as Node)) {
        setExpandedIdx(null)
        setMessage("")
        onDockToggle?.(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [closeOnClickOutside, onDockToggle])

  const selected = expandedIdx !== null ? agents[expandedIdx] : null
  const isExpanded = expandedIdx !== null

  function handleClick(i: number) {
    if (expandedIdx === i) {
      setExpandedIdx(null)
      setMessage("")
      onDockToggle?.(false)
    } else {
      setExpandedIdx(i)
      onSelect?.(agents[i])
      onDockToggle?.(true)
    }
  }

  function send() {
    if (!message.trim() || expandedIdx === null) return
    const agent = agents[expandedIdx]
    onSend?.(message.trim(), agent)
    setMessage("")
    if (closeOnSend) {
      setExpandedIdx(null)
      onDockToggle?.(false)
    }
  }

  const positionCls = position === "top"
    ? "fixed top-4 left-1/2 -translate-x-1/2 z-40"
    : "fixed left-1/2 -translate-x-1/2 z-40"
  const posStyle = position === "bottom"
    ? { bottom: `calc(env(safe-area-inset-bottom, 0px) + 14px)` }
    : undefined

  const gradient = selected?.gradient
    ? `linear-gradient(to right, ${selected.gradient})`
    : selected
      ? `linear-gradient(to right, color-mix(in oklab, ${selected.color} 35%, white), color-mix(in oklab, ${selected.color} 12%, white))`
      : undefined

  return (
    <motion.div
      ref={dockRef}
      className={cn(positionCls, className)}
      style={posStyle}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
    >
      <motion.div
        className="rounded-full px-3 py-2 shadow-2xl border border-[color:var(--border)] bg-[color:var(--surface)]"
        animate={{
          width: isExpanded ? expandedWidth : collapsedWidth || undefined,
          background: gradient || "var(--surface)",
        }}
        transition={{
          type: "spring",
          stiffness: isExpanded ? 300 : 500,
          damping: isExpanded ? 30 : 35,
          background: { duration: 0.25, ease: "easeInOut" },
        }}
      >
        <div className="flex items-center gap-2 relative">
          {/* Leading sparkle (collapses when expanded) */}
          <motion.button
            type="button"
            aria-label="Agents"
            className="w-9 h-9 flex items-center justify-center flex-shrink-0"
            animate={{ opacity: isExpanded ? 0 : 1, scale: isExpanded ? 0.6 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <SparklesIcon size={16} className="text-[color:var(--green-700)]" aria-hidden />
          </motion.button>

          {/* Agent buttons */}
          {agents.map((a, i) => {
            const selectedThis = expandedIdx === i
            return (
              <motion.div
                key={a.id}
                className={cn("relative flex-shrink-0", selectedThis && isExpanded && "absolute left-1 top-1 z-20")}
                style={{
                  width: selectedThis && isExpanded ? 0 : "auto",
                  minWidth: selectedThis && isExpanded ? 0 : "auto",
                  overflow: "visible",
                }}
                animate={{
                  opacity: isExpanded && !selectedThis ? 0 : 1,
                  y: isExpanded && !selectedThis ? 40 : 0,
                  scale: isExpanded && !selectedThis ? 0.8 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 28,
                  delay: isExpanded && !selectedThis ? i * 0.04 : 0,
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => handleClick(i)}
                  aria-label={`Message ${a.name}`}
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center",
                    selectedThis && isExpanded ? "bg-white/90" : "",
                  )}
                  style={
                    selectedThis && isExpanded
                      ? undefined
                      : { background: `linear-gradient(135deg, ${a.color}, color-mix(in oklab, ${a.color} 70%, black))` }
                  }
                  whileHover={reduced ? undefined : { scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center",
                      selectedThis && isExpanded ? "text-[color:var(--fg)]" : "text-white",
                    )}
                  >
                    {a.icon}
                  </span>
                  {a.online !== false && (
                    <motion.span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[color:var(--green-500)] border-2 border-[color:var(--surface)]"
                      initial={{ scale: 0 }}
                      animate={{ scale: isExpanded && !selectedThis ? 0 : 1 }}
                      transition={{
                        delay: isExpanded ? (selectedThis ? 0.3 : 0) : i * 0.08 + 0.4,
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              </motion.div>
            )
          })}

          {/* Expanded message input */}
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                key="msg"
                type="text"
                value={message}
                placeholder={placeholder(selected?.name || "")}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send()
                  if (e.key === "Escape" && closeOnEscape) {
                    setExpandedIdx(null)
                    setMessage("")
                    onDockToggle?.(false)
                  }
                }}
                autoFocus={autoFocus}
                className="absolute left-14 right-14 bg-transparent border-none outline-none text-sm font-medium text-[color:var(--stone-900)] placeholder:text-[color:var(--stone-700)]"
                initial={{ opacity: 0, x: 12 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 0.18, type: "spring", stiffness: 400, damping: 30 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              />
            )}
          </AnimatePresence>

          {/* Trailing button: menu → send */}
          <motion.div
            className={cn(
              "flex items-center justify-center flex-shrink-0 z-20 ml-auto",
              isExpanded && "absolute right-0",
            )}
          >
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.button
                  key="menu"
                  type="button"
                  className="w-9 h-9 flex items-center justify-center text-[color:var(--muted)]"
                  aria-label="More"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <MenuIcon size={16} aria-hidden />
                </motion.button>
              ) : (
                <motion.button
                  key="send"
                  type="button"
                  onClick={send}
                  disabled={!message.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[color:var(--stone-900)] disabled:opacity-50"
                  aria-label="Send message"
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    transition: { delay: 0.22, type: "spring", stiffness: 400, damping: 30 },
                  }}
                  exit={{ opacity: 0, scale: 0, rotate: 90, transition: { duration: 0.1 } }}
                >
                  <SendIcon size={14} aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
