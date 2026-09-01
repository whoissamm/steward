"use client"

import { useEffect } from "react"
import { useProfile } from "@/hooks/useProfile"

export function ThemeSync() {
  const { profile, loaded } = useProfile()
  useEffect(() => {
    if (!loaded || typeof document === "undefined") return
    document.documentElement.classList.toggle("dark", !!profile.dark_mode)
    document.documentElement.classList.toggle("large-text", !!profile.large_text)
  }, [loaded, profile.dark_mode, profile.large_text])
  return null
}
