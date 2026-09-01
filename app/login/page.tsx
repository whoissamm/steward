"use client"

import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/useProfile"
import { LoginForm } from "@/components/ui/login-form"
import { VerdantSwirl } from "@/components/ui/verdant-swirl"

export default function LoginPage() {
  const router = useRouter()
  const { profile, update } = useProfile()

  function onSubmit(name: string) {
    update({ name })
    router.push("/onboard")
  }

  return (
    <main className="screen no-nav items-center justify-center min-h-[100dvh] relative">
      <VerdantSwirl />
      <LoginForm onSubmit={onSubmit} defaultName={profile.name} />
    </main>
  )
}
