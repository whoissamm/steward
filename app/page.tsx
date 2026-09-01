"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { SproutIcon, ArrowRightIcon, ShieldCheckIcon, WifiOffIcon, MicIcon } from "lucide-react"
import { loadLocalProfile, hasOnboarded } from "@/lib/profile"
import { VerdantSwirl } from "@/components/ui/verdant-swirl"

const FEATURES = [
  { Icon: MicIcon, text: "Voice-first — in your accent" },
  { Icon: ShieldCheckIcon, text: "Cites its sources, never guesses" },
  { Icon: WifiOffIcon, text: "Works when broadband is patchy" },
]

export default function RootPage() {
  const router = useRouter()
  const reduced = useReducedMotion()
  const [routing, setRouting] = useState<"loading" | "welcome">("loading")

  useEffect(() => {
    const p = loadLocalProfile()
    if (hasOnboarded(p)) {
      router.replace("/home")
    } else if (p && p.name) {
      router.replace("/onboard")
    } else {
      setRouting("welcome")
    }
  }, [router])

  if (routing === "loading") {
    return (
      <main className="screen no-nav items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[color:var(--green-700)] text-white flex items-center justify-center text-2xl font-bold">
          S
        </div>
        <p className="text-sm text-[color:var(--muted)]">Loading Steward…</p>
      </main>
    )
  }

  return (
    <main className="screen no-nav items-center justify-center text-center min-h-[100dvh] relative overflow-hidden">
      <VerdantSwirl />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 pt-4"
      >
        <motion.div
          initial={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.15 }}
          className="w-20 h-20 rounded-3xl bg-[color:var(--green-700)] text-white flex items-center justify-center shadow-2xl"
          style={{ boxShadow: "0 12px 40px color-mix(in oklab, var(--green-600) 40%, transparent)" }}
        >
          <SproutIcon size={40} aria-hidden />
        </motion.div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--green-700)]">
          Steward
        </p>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold leading-tight max-w-lg"
      >
        Your farm&apos;s
        <br />
        <span className="text-[color:var(--green-700)]">everyday</span> companion.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-[color:var(--muted)] max-w-md text-lg leading-relaxed"
      >
        Voice-first advice on soil, weather, schemes and stock — in plain English,
        cited to sources you can trust.
      </motion.p>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8, staggerChildren: 0.15 }}
        className="flex flex-col gap-3 items-center"
      >
        {FEATURES.map(({ Icon, text }, i) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-[color:var(--fg)]"
          >
            <span className="w-8 h-8 rounded-full bg-[color:var(--amber-100)] text-[color:var(--amber-700)] flex items-center justify-center flex-shrink-0">
              <Icon size={16} aria-hidden />
            </span>
            <span>{text}</span>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="flex flex-col items-center gap-3 pt-4 w-full max-w-sm"
      >
        <Link href="/login" className="btn-primary w-full text-base">
          Get started <ArrowRightIcon size={18} aria-hidden />
        </Link>
        <p className="text-xs text-[color:var(--muted)]">
          Free · Works offline · Install on your phone
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="text-[10px] text-[color:var(--muted)] max-w-sm mt-8"
      >
        Steward is a decision aid, not a licensed adviser. For regulated matters (vet, pesticide,
        disposal), we point you to a qualified professional.
      </motion.p>
    </main>
  )
}
