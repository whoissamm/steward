"use client"

import { motion, type Variants } from "framer-motion"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface OnboardingWelcomeScreenProps {
  heroImage?: string
  heroAlt?: string
  title?: string
  description?: string
  ctaLabel?: string
  loginLabel?: string
  onStart?: () => void
  onLogin?: () => void
  className?: string
}

const EASE = [0.22, 0.61, 0.36, 1] as [number, number, number, number]

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  }),
}

export function OnboardingWelcomeScreen({
  heroImage = "https://picsum.photos/seed/onboard/800/900",
  heroAlt = "Welcome illustration",
  title = "Your farm's AI companion",
  description = "Get personalised advice, daily plans, and weather alerts — tailored to your land and season.",
  ctaLabel = "Let's get started",
  loginLabel = "Already have an account? Log in",
  onStart,
  onLogin,
  className,
}: OnboardingWelcomeScreenProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col w-full min-h-svh overflow-hidden bg-background",
        className
      )}
    >
      {/* Hero image — top 55% */}
      <div className="relative flex-none overflow-hidden" style={{ height: "55svh" }}>
        <motion.div
          className="w-full h-full"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img
            src={heroImage}
            alt={heroAlt}
            className="w-full h-full object-cover"
            priority-hint="high"
          />
        </motion.div>

        {/* Gradient into content below */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>

      {/* Content — bottom 45% */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center px-6 pt-4 pb-10 text-center gap-6"
        style={{ minHeight: "45svh" }}
      >
        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground max-w-sm"
          custom={0}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-base text-muted-foreground max-w-xs leading-relaxed"
          custom={0.1}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
        >
          {description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col items-center gap-3 w-full max-w-xs"
          custom={0.2}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
        >
          <Button
            size="lg"
            className="w-full text-base font-semibold shadow-md"
            onClick={onStart}
          >
            {ctaLabel}
          </Button>

          <button
            onClick={onLogin}
            className={cn(
              "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
              "focus-visible:outline-none focus-visible:underline"
            )}
          >
            <LogIn className="w-4 h-4" />
            {loginLabel}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
