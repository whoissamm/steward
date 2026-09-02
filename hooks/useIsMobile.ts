"use client"

import { useEffect, useState } from "react"

/**
 * Returns true when viewport is <= 639px (matches Tailwind's sm breakpoint).
 * Starts as `false` so SSR + first paint assume desktop; switches to `true`
 * after the media query settles on the client. This is intentional — animations
 * lean heavier on desktop where they always work, and are automatically
 * simplified on mobile where filters/scale hurt paint performance.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const m = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobile(m.matches)
    update()
    m.addEventListener("change", update)
    return () => m.removeEventListener("change", update)
  }, [])

  return isMobile
}
