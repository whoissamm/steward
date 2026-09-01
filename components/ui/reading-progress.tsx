"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const WORDS_PER_MINUTE = 200

export function useReadingProgress(targetRef?: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0)
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const wordCountRef = useRef<number>(0)

  // Estimate word count once target mounts
  useEffect(() => {
    const el = targetRef?.current ?? document.body
    const text = el.innerText ?? el.textContent ?? ""
    const words = text.trim().split(/\s+/).filter(Boolean).length
    wordCountRef.current = words
    const totalMinutes = words / WORDS_PER_MINUTE
    setMinutesLeft(Math.ceil(totalMinutes))
  }, [targetRef])

  const update = useCallback(() => {
    const el = targetRef?.current
    let scrolled: number
    let total: number

    if (el) {
      scrolled = el.scrollTop
      total = el.scrollHeight - el.clientHeight
    } else {
      scrolled = window.scrollY
      total = document.documentElement.scrollHeight - window.innerHeight
    }

    if (total <= 0) { setProgress(100); setIsComplete(true); return }

    const pct = Math.min(100, Math.max(0, (scrolled / total) * 100))
    setProgress(pct)

    const words = wordCountRef.current
    const totalMinutes = words / WORDS_PER_MINUTE
    const readMinutes = (pct / 100) * totalMinutes
    const left = Math.max(0, Math.ceil(totalMinutes - readMinutes))
    setMinutesLeft(left)
    setIsComplete(pct >= 99.5)
  }, [targetRef])

  useEffect(() => {
    const el = targetRef?.current
    const target = el ?? window

    target.addEventListener("scroll", update, { passive: true })
    update()

    // IntersectionObserver to detect end of article
    if (el) {
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setIsComplete(true) },
        { threshold: 0.95 }
      )
      // Observe last child
      const lastChild = el.lastElementChild
      if (lastChild) io.observe(lastChild)
      return () => {
        target.removeEventListener("scroll", update)
        io.disconnect()
      }
    }

    return () => target.removeEventListener("scroll", update)
  }, [update, targetRef])

  return { progress, minutesLeft, isComplete }
}

export interface ReadingProgressProps {
  targetRef?: React.RefObject<HTMLElement>
  fixed?: boolean
  showMinutesLeft?: boolean
  className?: string
  height?: number
}

export function ReadingProgress({
  targetRef,
  fixed = true,
  showMinutesLeft = true,
  className,
  height = 3,
}: ReadingProgressProps) {
  const { progress, minutesLeft, isComplete } = useReadingProgress(targetRef)

  return (
    <div
      className={cn(
        fixed ? "fixed top-0 left-0 right-0 z-50" : "relative w-full",
        className
      )}
    >
      {/* Progress bar */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isComplete ? "bg-emerald-100 dark:bg-emerald-950" : "bg-transparent"
        )}
        style={{ height }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Reading progress"
      >
        <div
          className={cn(
            "h-full transition-all duration-150 ease-linear",
            isComplete
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-primary via-primary/80 to-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Minutes left badge */}
      {showMinutesLeft && (
        <div
          className={cn(
            "absolute right-3 transition-all duration-300",
            fixed ? "top-2" : "-bottom-7"
          )}
        >
          {isComplete ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" strokeWidth={3} /> Done
            </span>
          ) : minutesLeft !== null ? (
            <span className="text-xs font-medium text-muted-foreground bg-background/90 px-2 py-0.5 rounded-full border border-border shadow-sm">
              {minutesLeft === 0
                ? "Almost done"
                : `${minutesLeft} min${minutesLeft === 1 ? "" : "s"} left`}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
