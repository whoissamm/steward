"use client"

import { useState, type FormEvent } from "react"
import { SproutIcon, ArrowRightIcon } from "lucide-react"

export function LoginForm({
  onSubmit,
  defaultName = "",
}: {
  onSubmit: (name: string) => void
  defaultName?: string
}) {
  const [name, setName] = useState(defaultName)
  const [touched, setTouched] = useState(false)
  const disabled = name.trim().length === 0

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!disabled) onSubmit(name.trim())
  }

  return (
    <form
      onSubmit={submit}
      className="card w-full max-w-sm flex flex-col gap-5 items-center text-center"
    >
      <div className="w-14 h-14 rounded-full bg-[color:var(--green-700)] text-white flex items-center justify-center">
        <SproutIcon size={26} aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Welcome to Steward</h1>
        <p className="text-sm text-[color:var(--muted)]">Sign in to your farm.</p>
      </div>
      <label htmlFor="login-name" className="w-full flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium">What&apos;s your first name?</span>
        <input
          id="login-name"
          className="input"
          placeholder="e.g. Sam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
          enterKeyHint="go"
        />
        {touched && disabled && (
          <span className="text-xs text-[color:var(--red-600)]">Please enter your name to continue.</span>
        )}
      </label>
      <button type="submit" className="btn-primary w-full" disabled={disabled}>
        Get started <ArrowRightIcon size={16} aria-hidden />
      </button>
      <p className="text-xs text-[color:var(--muted)] leading-relaxed max-w-[280px]">
        No password needed. Steward is local-first — your profile stays on this device unless you
        choose to sync later.
      </p>
    </form>
  )
}
