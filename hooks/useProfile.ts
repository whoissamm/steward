"use client"

import { useCallback, useEffect, useState } from "react"
import type { Profile } from "@/lib/api"
import { DEFAULT_PROFILE, loadLocalProfile, saveLocalProfile } from "@/lib/profile"

export type ProfileState = {
  profile: Profile
  loaded: boolean
  update: (patch: Partial<Profile>) => void
  replace: (next: Profile) => void
}

export function useProfile(): ProfileState {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const local = loadLocalProfile()
    if (local) setProfile(local)
    setLoaded(true)
  }, [])

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      saveLocalProfile(next)
      return next
    })
  }, [])

  const replace = useCallback((next: Profile) => {
    saveLocalProfile(next)
    setProfile(next)
  }, [])

  return { profile, loaded, update, replace }
}
