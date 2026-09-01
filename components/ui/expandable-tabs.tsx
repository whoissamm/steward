"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
  content?: React.ReactNode
}

export type TabEntry = TabItem | "separator"

export interface ExpandableTabsProps {
  tabs: TabEntry[]
  defaultActiveId?: string
  onChange?: (id: string | null) => void
  className?: string
}

function Separator() {
  return (
    <div className="self-stretch my-1 w-px bg-border/60 flex-shrink-0" aria-hidden />
  )
}

function Tab({
  tab,
  isActive,
  onSelect,
}: {
  tab: TabItem
  isActive: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={isActive}
      aria-controls={`tabpanel-${tab.id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(tab.id)}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium outline-none",
        "transition-colors duration-150 select-none cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* Active background pill */}
      {isActive && (
        <motion.span
          layoutId="tab-active-bg"
          className="absolute inset-0 rounded-xl bg-muted"
          style={{ zIndex: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 38 }}
        />
      )}

      <span className="relative z-10 flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {tab.icon}
      </span>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 overflow-hidden whitespace-nowrap"
            style={{ display: "inline-block" }}
          >
            {tab.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function ExpandableTabs({
  tabs,
  defaultActiveId,
  onChange,
  className,
}: ExpandableTabsProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultActiveId ?? null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback(
    (id: string) => {
      const next = id === activeId ? null : id
      setActiveId(next)
      onChange?.(next)
    },
    [activeId, onChange]
  )

  // Click outside to collapse
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveId(null)
        onChange?.(null)
      }
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [onChange])

  // Keyboard: arrow keys navigate between tabs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tabItems = tabs.filter((t): t is TabItem => t !== "separator")
    const currentIdx = tabItems.findIndex((t) => t.id === activeId)
    if (e.key === "ArrowRight") {
      const next = (currentIdx + 1) % tabItems.length
      handleSelect(tabItems[next].id)
    }
    if (e.key === "ArrowLeft") {
      const prev = (currentIdx - 1 + tabItems.length) % tabItems.length
      handleSelect(tabItems[prev].id)
    }
    if (e.key === "Escape") {
      setActiveId(null)
      onChange?.(null)
    }
  }

  const activeTab = tabs.find((t): t is TabItem => t !== "separator" && t.id === activeId) ?? null

  return (
    <div className={cn("w-full", className)}>
      {/* Tab bar */}
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Navigation tabs"
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex items-center gap-1 p-1.5 rounded-2xl",
          "bg-background/80 backdrop-blur-sm border border-border/60 shadow-sm"
        )}
      >
        {tabs.map((entry, i) => {
          if (entry === "separator") return <Separator key={`sep-${i}`} />
          return (
            <Tab
              key={entry.id}
              tab={entry}
              isActive={entry.id === activeId}
              onSelect={handleSelect}
            />
          )
        })}
      </div>

      {/* Tab panel */}
      <AnimatePresence mode="wait">
        {activeTab?.content && (
          <motion.div
            key={activeTab.id}
            id={`tabpanel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            {activeTab.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
