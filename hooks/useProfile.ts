"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DEFAULT_PROFILE,
  loadLocalProfile,
  saveLocalProfile,
  markCompletionToday,
  pushActivity,
  type ProfileV2,
} from "@/lib/profile"

export type ProfileState = {
  profile: ProfileV2
  loaded: boolean
  update: (patch: Partial<ProfileV2>) => void
  replace: (next: ProfileV2) => void
  markCompletion: () => void
  logActivity: (action: string, meta?: Record<string, unknown>) => void
}

export function useProfile(): ProfileState {
  const [profile, setProfile] = useState<ProfileV2>(DEFAULT_PROFILE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const local = loadLocalProfile()
    if (local) setProfile(local)
    setLoaded(true)
  }, [])

  const update = useCallback((patch: Partial<ProfileV2>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      saveLocalProfile(next)
      return next
    })
  }, [])

  const replace = useCallback((next: ProfileV2) => {
    saveLocalProfile(next)
    setProfile(next)
  }, [])

  const markCompletion = useCallback(() => {
    setProfile((prev) => {
      const next = markCompletionToday(prev)
      saveLocalProfile(next)
      return next
    })
  }, [])

  const logActivity = useCallback((action: string, meta?: Record<string, unknown>) => {
    setProfile((prev) => {
      const next = pushActivity(prev, action, meta)
      saveLocalProfile(next)
      return next
    })
  }, [])

  return { profile, loaded, update, replace, markCompletion, logActivity }
}
