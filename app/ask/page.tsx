"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function Redirect() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    const q = params.get("q")
    const target = q ? `/agents/steward?q=${encodeURIComponent(q)}` : "/agents/steward"
    router.replace(target)
  }, [params, router])
  return (
    <main className="screen">
      <p className="text-sm text-[color:var(--muted)]">Opening chat…</p>
    </main>
  )
}

export default function AskPage() {
  return (
    <Suspense
      fallback={
        <main className="screen">
          <p className="text-sm text-[color:var(--muted)]">Opening chat…</p>
        </main>
      }
    >
      <Redirect />
    </Suspense>
  )
}
