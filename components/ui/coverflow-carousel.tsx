"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface CoverflowSlide {
  id: string
  image: string
  title: string
  subtitle?: string
  tag?: string
}

export interface CoverflowCarouselProps {
  slides?: CoverflowSlide[]
  autoAdvance?: boolean
  autoAdvanceInterval?: number
  className?: string
  onSlideChange?: (index: number) => void
}

const SIDE_SCALE = 0.82
const SIDE_ROTATE_Y = 42
const FAR_SIDE_SCALE = 0.68
const FAR_SIDE_ROTATE_Y = 55

function getCardStyle(offset: number): React.CSSProperties {
  if (offset === 0) {
    return {
      transform: `translateX(0%) scale(1) rotateY(0deg)`,
      zIndex: 10,
      opacity: 1,
    }
  }
  const absOffset = Math.abs(offset)
  const sign = Math.sign(offset)
  const isFar = absOffset > 1

  const scale = isFar ? FAR_SIDE_SCALE : SIDE_SCALE
  const rotateY = (isFar ? FAR_SIDE_ROTATE_Y : SIDE_ROTATE_Y) * -sign
  const translateX = sign * (isFar ? 165 : 110)
  const opacity = isFar ? 0.4 : 0.75
  const zIndex = isFar ? 6 - absOffset : 8 - absOffset

  return {
    transform: `translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`,
    zIndex,
    opacity,
  }
}

const DEFAULT_SLIDES: CoverflowSlide[] = [
  { id: "1", image: "https://picsum.photos/seed/cf1/600/400", title: "Alpine Meadows", subtitle: "Swiss Alps, 2024", tag: "Nature" },
  { id: "2", image: "https://picsum.photos/seed/cf2/600/400", title: "Urban Geometry", subtitle: "Tokyo, Japan", tag: "Architecture" },
  { id: "3", image: "https://picsum.photos/seed/cf3/600/400", title: "Golden Hour", subtitle: "Tuscany, Italy", tag: "Landscape" },
  { id: "4", image: "https://picsum.photos/seed/cf4/600/400", title: "Ocean Depths", subtitle: "Great Barrier Reef", tag: "Marine" },
  { id: "5", image: "https://picsum.photos/seed/cf5/600/400", title: "City Lights", subtitle: "New York, USA", tag: "Urban" },
]

export function CoverflowCarousel({
  slides = DEFAULT_SLIDES,
  autoAdvance = true,
  autoAdvanceInterval = 3500,
  className,
  onSlideChange,
}: CoverflowCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const go = useCallback(
    (next: number) => {
      const clamped = ((next % slides.length) + slides.length) % slides.length
      setDirection(next > current ? 1 : -1)
      setCurrent(clamped)
      onSlideChange?.(clamped)
    },
    [current, slides.length, onSlideChange]
  )

  const prev = () => go(current - 1)
  const next = () => go(current + 1)

  useEffect(() => {
    if (!autoAdvance) return
    intervalRef.current = setInterval(() => go(current + 1), autoAdvanceInterval)
    return () => clearInterval(intervalRef.current)
  }, [autoAdvance, autoAdvanceInterval, go, current])

  const activeSlide = slides[current]

  // Visible range: -2 to +2 relative to current
  const visibleOffsets = [-2, -1, 0, 1, 2]

  return (
    <div className={cn("relative w-full overflow-hidden py-16", className)}>
      {/* Ambient background from active slide */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-30 blur-3xl scale-110"
          style={{
            backgroundImage: `url(${activeSlide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      {/* Stage */}
      <div
        className="relative mx-auto"
        style={{ perspective: "1200px", maxWidth: "700px", height: "380px" }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {visibleOffsets.map((offset) => {
            const idx = ((current + offset) % slides.length + slides.length) % slides.length
            const slide = slides[idx]
            const style = getCardStyle(offset)
            const isActive = offset === 0

            return (
              <div
                key={`${idx}-${offset}`}
                className="absolute w-full max-w-[420px] cursor-pointer"
                style={{
                  ...style,
                  transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.5s ease",
                  transformStyle: "preserve-3d",
                }}
                onClick={() => !isActive && go(current + offset)}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/2]">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  {/* Tag */}
                  {slide.tag && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/60 text-white backdrop-blur-sm">
                      {slide.tag}
                    </span>
                  )}
                </div>

                {/* Active card text reveal */}
                {isActive && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={slide.id}
                      initial={{ y: 32, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -16, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="mt-4 text-center px-4"
                    >
                      <h3 className="text-lg font-bold text-foreground">{slide.title}</h3>
                      {slide.subtitle && (
                        <p className="text-sm text-muted-foreground mt-0.5">{slide.subtitle}</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-background/80 border border-border hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Previous slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === current ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              )}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-background/80 border border-border hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Next slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  )
}
