import type { Profile } from "./api"

const KEY = "steward.profile.v1"

export const DEFAULT_PROFILE: Profile = {
  id: "default",
  name: "",
  accent: "standard",
  farm_type: "mixed",
  has_sensors: false,
  read_aloud: true,
  dark_mode: false,
  large_text: false,
  points: 0,
  turns: 0,
  streak: 0,
  badges: [],
  lesson_done: [],
  quiz_done: [],
}

export function loadLocalProfile(): Profile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PROFILE, ...parsed }
  } catch {
    return null
  }
}

export function saveLocalProfile(p: Profile) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(p))
}

export function clearLocalProfile() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEY)
}

export function hasOnboarded(p: Profile | null | undefined): boolean {
  return !!(p && p.name && p.accent && p.farm_type)
}
