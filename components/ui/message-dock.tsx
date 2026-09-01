"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DockCharacter {
  id: string
  emoji: string
  name: string
  role: string
  online?: boolean
  gradient?: string
}

export interface MessageDockProps {
  characters?: DockCharacter[]
  onSend?: (characterId: string, message: string) => void
  className?: string
}

const DEFAULT_CHARACTERS: DockCharacter[] = [
  { id: "1", emoji: "🌱", name: "Willow", role: "Crop Advisor", online: true, gradient: "from-emerald-500 to-teal-600" },
  { id: "2", emoji: "🐄", name: "Angus", role: "Livestock Guide", online: true, gradient: "from-amber-500 to-orange-600" },
  { id: "3", emoji: "🌦️", name: "Skye", role: "Weather Analyst", online: false, gradient: "from-blue-500 to-indigo-600" },
  { id: "4", emoji: "🔧", name: "Mac", role: "Equipment Helper", online: true, gradient: "from-slate-500 to-gray-700" },
]

function CharacterPanel({
  character,
  onSend,
  onClose,
}: {
  character: DockCharacter
  onSend?: (id: string, msg: string) => void
  onClose: () => void
}) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSend?.(character.id, trimmed)
    setInput("")
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape") onClose()
  }

  const gradient = character.gradient ?? "from-primary to-primary/60"

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="w-80 rounded-2xl overflow-hidden border border-border shadow-2xl bg-card"
    >
      {/* Gradient header */}
      <div className={cn("relative px-4 pt-4 pb-5 bg-gradient-to-br", gradient)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
              {character.emoji}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{character.name}</h3>
              <p className="text-white/80 text-xs mt-0.5">{character.role}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    character.online ? "bg-emerald-300 animate-pulse" : "bg-white/40"
                  )}
                />
                <span className="text-[11px] text-white/70">
                  {character.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-xl leading-none -mt-1"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>
      </div>

      {/* Chat area placeholder */}
      <div className="h-28 flex items-center justify-center bg-muted/30 border-b border-border">
        <p className="text-xs text-muted-foreground text-center px-4">
          Ask {character.name} anything about{" "}
          <span className="font-medium text-foreground">{character.role.toLowerCase()}</span>.
        </p>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${character.name}…`}
          className={cn(
            "flex-1 min-w-0 text-sm px-3 py-2 rounded-xl",
            "bg-muted border border-border outline-none",
            "placeholder:text-muted-foreground text-foreground",
            "focus:ring-2 focus:ring-ring transition-shadow"
          )}
          aria-label={`Message ${character.name}`}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-xl transition-all",
            "bg-primary text-primary-foreground",
            "hover:opacity-90 active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export function MessageDock({
  characters = DEFAULT_CHARACTERS,
  onSend,
  className,
}: MessageDockProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const dockRef = useRef<HTMLDivElement>(null)

  // Click outside closes panel
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActiveId(null)
      }
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  // Escape closes panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const activeCharacter = characters.find((c) => c.id === activeId) ?? null

  const handleSelect = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id))
  }

  return (
    <div ref={dockRef} className={cn("relative flex flex-col items-center", className)}>
      {/* Expanded panel */}
      <AnimatePresence>
        {activeCharacter && (
          <div className="absolute bottom-full mb-3 right-0">
            <CharacterPanel
              key={activeCharacter.id}
              character={activeCharacter}
              onSend={onSend}
              onClose={() => setActiveId(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Dock */}
      <div className="flex items-end gap-2 px-4 py-3 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/60 shadow-xl">
        {characters.map((char) => {
          const isActive = char.id === activeId
          return (
            <motion.button
              key={char.id}
              onClick={() => handleSelect(char.id)}
              aria-label={`Open chat with ${char.name}`}
              aria-pressed={isActive}
              whileHover={{ y: -6, scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              animate={isActive ? { y: -8, scale: 1.2 } : { y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={cn(
                "relative flex items-center justify-center",
                "w-12 h-12 rounded-2xl text-2xl",
                "transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "shadow-lg ring-2 ring-primary"
                  : "hover:shadow-md",
                "bg-gradient-to-br",
                char.gradient ?? "from-primary to-primary/70"
              )}
            >
              {char.emoji}
              {/* Online indicator */}
              {char.online && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
