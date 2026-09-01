"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { SensorReadings } from "@/lib/api"
import { api } from "@/lib/api"

const BASE_POLL_MS = 4000
const MAX_POLL_MS = 30_000

export function useSensors(enabled: boolean) {
  const [readings, setReadings] = useState<SensorReadings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const backoffRef = useRef(BASE_POLL_MS)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const tick = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError("Offline")
      return
    }
    try {
      const r = await api.sensors()
      setReadings(r)
      setError(null)
      backoffRef.current = BASE_POLL_MS
    } catch (e) {
      setError((e as Error).message)
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_POLL_MS)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    clearTimer()
    tick()
  }, [tick])

  useEffect(() => {
    if (!enabled) {
      setReadings(null)
      setLoading(false)
      clearTimer()
      return
    }
    let cancelled = false
    const scheduleNext = () => {
      timerRef.current = setTimeout(async () => {
        if (cancelled) return
        await tick()
        if (!cancelled) scheduleNext()
      }, backoffRef.current)
    }
    tick().then(() => {
      if (!cancelled) scheduleNext()
    })
    const onVisibility = () => {
      if (!document.hidden && !cancelled) {
        backoffRef.current = BASE_POLL_MS
        refresh()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("online", refresh)
    return () => {
      cancelled = true
      clearTimer()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("online", refresh)
    }
  }, [enabled, tick, refresh])

  return { readings, error, loading, refresh }
}
