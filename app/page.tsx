"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadLocalProfile, hasOnboarded } from "@/lib/profile"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const profile = loadLocalProfile()
    router.replace(hasOnboarded(profile) ? "/home" : "/onboard")
  }, [router])

  return (
    <main className="screen items-center justify-center text-center">
      <div className="flex flex-col items-center gap-3 pt-16">
        <div className="w-16 h-16 rounded-full bg-[color:var(--green-700)] text-white flex items-center justify-center text-2xl font-bold">S</div>
        <p className="text-lg font-semibold">Steward</p>
        <p className="text-sm text-[color:var(--muted)]">Loading your farm…</p>
      </div>
    </main>
  )
}
