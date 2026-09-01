"use client"

import { useState, useRef, useCallback } from "react"
import { Reorder, useDragControls, AnimatePresence, motion } from "framer-motion"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ReorderItem {
  id: string
  content: React.ReactNode
  label?: string // accessible label for screen-reader announcements
}

export interface ReorderListProps {
  items?: ReorderItem[]
  onChange?: (items: ReorderItem[]) => void
  className?: string
  itemClassName?: string
}

function DraggableItem({
  item,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  announce,
  itemClassName,
}: {
  item: ReorderItem
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  announce: (msg: string) => void
  itemClassName?: string
}) {
  const controls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)
  const [grabbed, setGrabbed] = useState(false)
  const label = item.label ?? `Item ${item.id}`

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      setGrabbed((g) => {
        announce(!g ? `${label} grabbed. Use arrow keys to move.` : `${label} dropped.`)
        return !g
      })
    }
    if (grabbed) {
      if (e.key === "ArrowUp" && canMoveUp) {
        e.preventDefault()
        onMoveUp()
        announce(`${label} moved up.`)
      }
      if (e.key === "ArrowDown" && canMoveDown) {
        e.preventDefault()
        onMoveDown()
        announce(`${label} moved down.`)
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setGrabbed(false)
        announce(`${label} dropped.`)
      }
    }
  }

  return (
    <Reorder.Item
      value={item}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm select-none",
        "transition-shadow duration-150",
        isDragging && "shadow-xl ring-2 ring-primary/30 z-50",
        grabbed && "ring-2 ring-primary",
        itemClassName
      )}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      {/* Drag handle */}
      <button
        className={cn(
          "flex-shrink-0 cursor-grab active:cursor-grabbing rounded p-0.5",
          "text-muted-foreground hover:text-foreground transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          grabbed && "text-primary"
        )}
        onPointerDown={(e) => {
          e.preventDefault()
          controls.start(e)
        }}
        onKeyDown={handleKeyDown}
        aria-label={`Drag handle for ${label}. Press Space to grab, arrow keys to move.`}
        aria-pressed={grabbed}
        tabIndex={0}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">{item.content}</div>
    </Reorder.Item>
  )
}

const DEFAULT_ITEMS: ReorderItem[] = [
  { id: "1", content: <span className="text-sm font-medium">Morning soil check</span>, label: "Morning soil check" },
  { id: "2", content: <span className="text-sm font-medium">Irrigate field A</span>, label: "Irrigate field A" },
  { id: "3", content: <span className="text-sm font-medium">Check weather forecast</span>, label: "Check weather forecast" },
  { id: "4", content: <span className="text-sm font-medium">Inspect livestock fences</span>, label: "Inspect livestock fences" },
  { id: "5", content: <span className="text-sm font-medium">Update farm log</span>, label: "Update farm log" },
]

export function ReorderList({
  items: initialItems = DEFAULT_ITEMS,
  onChange,
  className,
  itemClassName,
}: ReorderListProps) {
  const [items, setItems] = useState<ReorderItem[]>(initialItems)
  const liveRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = ""
      requestAnimationFrame(() => {
        if (liveRef.current) liveRef.current.textContent = msg
      })
    }
  }, [])

  const handleReorder = (newItems: ReorderItem[]) => {
    setItems(newItems)
    onChange?.(newItems)
  }

  const moveItem = (id: string, direction: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id)
      if (idx < 0) return prev
      const next = idx + direction
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      onChange?.(arr)
      return arr
    })
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Screen-reader live region */}
      <div
        ref={liveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-2 list-none"
        as="ul"
      >
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <DraggableItem
              key={item.id}
              item={item}
              onMoveUp={() => moveItem(item.id, -1)}
              onMoveDown={() => moveItem(item.id, 1)}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
              announce={announce}
              itemClassName={itemClassName}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  )
}
