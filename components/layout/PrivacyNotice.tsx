"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheckIcon, XIcon } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded } from "@/lib/profile"
import Link from "next/link"

/**
 * One-time honest privacy notice. Not a fake GDPR modal — Steward doesn't set
 * tracking cookies, doesn't have an analytics vendor, and doesn't store your
 * profile on a server. This just tells the farmer what actually happens.
 * Shown on the first product page after onboarding until `privacy_ack` is true.
 */
export function PrivacyNotice() {
  const { profile, loaded, update } = useProfile()
  const [dismissing, setDismissing] = useState(false)

  if (!loaded || !hasOnboarded(profile) || profile.privacy_ack) return null

  function accept() {
    setDismissing(true)
    setTimeout(() => update({ privacy_ack: true }), 220)
  }

  return (
    <AnimatePresence>
      {!dismissing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="fixed left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-24px)] w-full sm:w-[420px]"
          style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + 92px)` }}
          role="dialog"
          aria-live="polite"
          aria-label="Privacy notice"
        >
          <div className="card flex flex-col gap-3 shadow-2xl border-[color:var(--green-600)]/40">
            <div className="flex items-start gap-2">
              <ShieldCheckIcon
                size={18}
                className="text-[color:var(--green-700)] mt-0.5 flex-shrink-0"
                aria-hidden
              />
              <div className="flex-1">
                <p className="font-semibold">A quick note on your data</p>
                <p className="text-sm text-[color:var(--muted)] mt-1 leading-snug">
                  Your farm profile, todos, calendar and chat history stay on this
                  device. When you ask a question, your text (and any photo) is sent
                  to Google Gemini for the answer, and the reply is sent to
                  ElevenLabs for the voice. Nothing is stored on Steward's servers.
                  You can turn off saved chat and clear everything in Settings.
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost !p-1"
                onClick={accept}
                aria-label="Dismiss"
              >
                <XIcon size={14} aria-hidden />
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/settings" className="btn-ghost text-xs">Open settings</Link>
              <button type="button" className="btn-primary text-sm" onClick={accept}>
                OK, got it
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
