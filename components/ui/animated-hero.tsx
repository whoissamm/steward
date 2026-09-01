"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoveRight, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"

const WORDS = ["amazing", "new", "wonderful", "beautiful", "smart"]

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full py-20 lg:py-40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Badge */}
          <div>
            <Button variant="secondary" size="sm" className="gap-2 text-sm">
              Read our launch article <MoveRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
              <span>This is something </span>
              <span className="relative inline-flex h-[1.1em] overflow-hidden align-middle">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    className="absolute left-0 text-primary"
                  >
                    {WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
                {/* Invisible spacer to keep width stable */}
                <span className="invisible" aria-hidden>
                  {WORDS.reduce((a, b) => (a.length >= b.length ? a : b))}
                </span>
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              Managing a small business today is already tough. Avoid further
              complications by using modern tooling to your advantage.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" className="gap-2">
              Jump on a call <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              Sign up here <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
