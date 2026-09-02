"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
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

const ProfileContext = createContext<ProfileState | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileV2>(DEFAULT_PROFILE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const local = loadLocalProfile()
    if (local) setProfile(local)
    setLoaded(true)
  }, [])

  // Cross-tab sync via storage events
  useEffect(() => {
    if (typeof window === "undefined") return
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "steward.profile.v2") return
      const local = loadLocalProfile()
      if (local) setProfile(local)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
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

  const value = useMemo<ProfileState>(
    () => ({ profile, loaded, update, replace, markCompletion, logActivity }),
    [profile, loaded, update, replace, markCompletion, logActivity],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileState {
  const ctx = useContext(ProfileContext)
  if (ctx) return ctx
  // Fallback for anything not wrapped (SSR or standalone) — read-only-ish local state
  return useLocalProfileFallback()
}

function useLocalProfileFallback(): ProfileState {
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
  return {
    profile,
    loaded,
    update,
    replace: (n) => {
      saveLocalProfile(n)
      setProfile(n)
    },
    markCompletion: () => {
      setProfile((prev) => {
        const next = markCompletionToday(prev)
        saveLocalProfile(next)
        return next
      })
    },
    logActivity: () => {
      /* noop */
    },
  }
}
