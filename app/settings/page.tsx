"use client"

import { useEffect, useRef, useState } from "react"
import { useProfile } from "@/hooks/useProfile"
import { ACCENTS } from "@/lib/dialect"
import { clearLocalProfile, DEFAULT_PROFILE } from "@/lib/profile"
import { useRouter } from "next/navigation"

const FARM_TYPES = [
  { id: "arable", label: "Arable" },
  { id: "livestock", label: "Livestock" },
  { id: "dairy", label: "Dairy" },
  { id: "mixed", label: "Mixed" },
  { id: "horticulture", label: "Horticulture" },
]

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <label className="flex flex-col gap-0.5 cursor-pointer flex-1">
        <span className="font-medium">{label}</span>
        {description && <span className="text-xs text-[color:var(--muted)]">{description}</span>}
      </label>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className="toggle"
      />
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { profile, loaded, update, replace } = useProfile()
  const [nameDraft, setNameDraft] = useState(profile.name)
  const [confirmReset, setConfirmReset] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (loaded) setNameDraft(profile.name)
  }, [loaded, profile.name])

  function onNameChange(v: string) {
    setNameDraft(v)
    if (nameTimer.current) clearTimeout(nameTimer.current)
    nameTimer.current = setTimeout(() => update({ name: v }), 400)
  }

  function resetProgress() {
    try {
      const wiped = {
        ...DEFAULT_PROFILE,
        name: profile.name,
        accent: profile.accent,
        farm_type: profile.farm_type,
        has_sensors: profile.has_sensors,
        read_aloud: profile.read_aloud,
        dark_mode: profile.dark_mode,
        large_text: profile.large_text,
      }
      replace(wiped)
      setConfirmReset(false)
      setStatus("Progress reset.")
      setTimeout(() => setStatus(null), 2000)
    } catch (e) {
      setStatus(`Reset failed: ${(e as Error).message}`)
      setTimeout(() => setStatus(null), 3500)
    }
  }

  function resetEverything() {
    clearLocalProfile()
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark", "large-text")
    }
    router.push("/onboard")
  }

  if (!loaded) {
    return <main className="screen"><p className="text-sm text-[color:var(--muted)]">Loading…</p></main>
  }

  return (
    <main className="screen">
      <header>
        <p className="sec">Settings</p>
        <h1 className="text-2xl font-bold">Your account</h1>
      </header>

      <section className="card flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-medium">Name</span>
          <input
            className="input"
            value={nameDraft}
            onChange={(e) => onNameChange(e.target.value)}
            autoComplete="given-name"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium">Accent (for voice output)</span>
          <select
            className="input"
            value={profile.accent}
            onChange={(e) => update({ accent: e.target.value })}
          >
            {ACCENTS.map((a) => (
              <option key={a.id} value={a.id}>{a.label} — {a.region}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium">Farm type</span>
          <select
            className="input"
            value={profile.farm_type}
            onChange={(e) => update({ farm_type: e.target.value })}
          >
            {FARM_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="card flex flex-col divide-y divide-[color:var(--border)]">
        <Toggle
          label="Farm sensors connected"
          description="Show the live sensor panel on Home and factor readings into answers."
          value={profile.has_sensors}
          onChange={(v) => update({ has_sensors: v })}
        />
        <Toggle
          label="Read aloud"
          description="Steward speaks answers using your chosen accent."
          value={profile.read_aloud}
          onChange={(v) => update({ read_aloud: v })}
        />
        <Toggle
          label="Dark / evening mode"
          description="Easier on the eyes in dim light."
          value={profile.dark_mode}
          onChange={(v) => update({ dark_mode: v })}
        />
        <Toggle
          label="Larger text"
          description="Bumps base font size for better readability."
          value={profile.large_text}
          onChange={(v) => update({ large_text: v })}
        />
      </section>

      <section className="card flex flex-col gap-3">
        <div>
          <p className="font-medium">
            Progress: {profile.points} pts · {profile.badges.length} badges · {profile.turns} questions
          </p>
          <p className="text-xs text-[color:var(--muted)]">You can reset stats without losing your name and accent.</p>
        </div>
        {!confirmReset ? (
          <button type="button" className="btn-secondary self-start" onClick={() => setConfirmReset(true)}>
            Reset progress
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[color:var(--muted)]">This clears points, badges and progress. Are you sure?</p>
            <div className="flex gap-2">
              <button type="button" className="btn-primary" onClick={resetProgress}>Yes, reset</button>
              <button type="button" className="btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          </div>
        )}
        <button type="button" className="btn-ghost self-start text-[color:var(--red-600)]" onClick={resetEverything}>
          Start onboarding again
        </button>
      </section>

      <p className="text-xs text-[color:var(--muted)] text-center pt-2">
        Steward is a decision aid for small farms in England, not a licensed adviser.
      </p>

      {status && <div className="toast" role="status">{status}</div>}
    </main>
  )
}
