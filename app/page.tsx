"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SproutIcon, ArrowRightIcon, ShieldCheckIcon, WifiOffIcon, MicIcon } from "lucide-react"
import { loadLocalProfile, hasOnboarded } from "@/lib/profile"

const FEATURES = [
  { Icon: MicIcon, text: "Voice-first — in your accent" },
  { Icon: ShieldCheckIcon, text: "Cites its sources, never guesses" },
  { Icon: WifiOffIcon, text: "Works when broadband is patchy" },
]

export default function RootPage() {
  const router = useRouter()
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
        <div className="w-14 h-14 rounded-2xl bg-[color:var(--green-700)] text-white flex items-center justify-center">
          <SproutIcon size={26} aria-hidden />
        </div>
      </main>
    )
  }

  return (
    <main className="screen no-nav" style={{ paddingTop: 40 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <div
          className="w-11 h-11 rounded-2xl bg-[color:var(--green-700)] text-white flex items-center justify-center"
          style={{ boxShadow: "0 6px 18px color-mix(in oklab, var(--green-600) 30%, transparent)" }}
        >
          <SproutIcon size={22} aria-hidden />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--green-700)]">
          Steward
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55 }}
        className="text-3xl md:text-4xl font-bold leading-tight max-w-lg mt-4"
      >
        Your farm&apos;s
        <br />
        <span className="text-[color:var(--green-700)]">everyday</span> companion.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.55 }}
        className="text-[color:var(--muted)] max-w-md leading-relaxed"
      >
        Voice-first advice on soil, weather, schemes and stock — in plain English, cited to sources you can trust.
      </motion.p>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="flex flex-col gap-2 mt-2"
      >
        {FEATURES.map(({ Icon, text }, i) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
            className="flex items-center gap-2 text-sm"
          >
            <span className="w-7 h-7 rounded-full bg-[color:var(--amber-100)] text-[color:var(--amber-700)] flex items-center justify-center flex-shrink-0">
              <Icon size={14} aria-hidden />
            </span>
            <span>{text}</span>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-6 flex flex-col gap-2 items-start"
      >
        <Link href="/login" className="btn-primary">
          Get started <ArrowRightIcon size={18} aria-hidden />
        </Link>
        <p className="text-xs text-[color:var(--muted)]">
          Free · Works offline · Install on your phone
        </p>
      </motion.div>

      <p className="text-[10px] text-[color:var(--muted)] max-w-md mt-10">
        Steward is a decision aid, not a licensed adviser. For regulated matters (vet, pesticide,
        disposal), we point you to a qualified professional.
      </p>
    </main>
  )
}
