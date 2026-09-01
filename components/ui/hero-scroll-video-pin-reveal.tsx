"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface HeroBadge {
  label: string
  shape?: "hex" | "pill" | "tag"
  color?: string
}

export interface HeroScrollVideoProps {
  headline?: string
  subline?: string
  videoSrc?: string
  videoPoster?: string
  badges?: HeroBadge[]
  className?: string
}

function getBadgeClipPath(shape: HeroBadge["shape"]) {
  switch (shape) {
    case "hex":
      return "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
    case "tag":
      return "polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)"
    case "pill":
    default:
      return undefined
  }
}

export function HeroBadge({ label, shape = "pill", color }: HeroBadge) {
  const clipPath = getBadgeClipPath(shape)
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-white uppercase tracking-widest",
        shape === "pill" && "rounded-full",
        shape !== "pill" && "rounded-none"
      )}
      style={{
        backgroundColor: color ?? "#6366f1",
        clipPath,
        paddingLeft: shape === "tag" ? "0.75rem" : undefined,
        paddingRight: shape === "tag" ? "1.25rem" : undefined,
      }}
    >
      {label}
    </span>
  )
}

export function HeroScrollVideoPinReveal({
  headline = "The future starts here",
  subline = "Scroll to reveal what we've been building.",
  videoSrc,
  videoPoster,
  badges = [],
  className,
}: HeroScrollVideoProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const sublineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    let gsap: typeof import("gsap").gsap | null = null
    let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null

    const init = async () => {
      try {
        const gsapModule = await import("gsap")
        const stModule = await import("gsap/ScrollTrigger")
        gsap = gsapModule.gsap
        ScrollTrigger = stModule.ScrollTrigger
        gsap.registerPlugin(ScrollTrigger)
      } catch {
        return
      }

      const section = sectionRef.current
      const content = contentRef.current
      const videoWrap = videoWrapRef.current
      if (!section || !content || !videoWrap || !gsap || !ScrollTrigger) return

      // Set initial states
      gsap.set(videoWrap, {
        clipPath: "inset(12% 22% 12% 22% round 20px)",
      })
      gsap.set(content, { opacity: 1, y: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })

      // Content fades out
      tl.to(
        content,
        {
          opacity: 0,
          y: -40,
          duration: 0.4,
          ease: "power2.in",
        },
        0
      )

      // Video expands
      tl.to(
        videoWrap,
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          duration: 1,
          ease: "power2.inOut",
        },
        0.1
      )

      // Try to play video
      if (videoRef.current) {
        videoRef.current.play().catch(() => {})
      }

      return () => {
        ScrollTrigger?.getAll().forEach((t) => t.kill())
      }
    }

    const cleanup = init()
    return () => {
      cleanup.then((fn) => fn?.())
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative w-full bg-background overflow-hidden",
        className
      )}
      style={{ height: "100vh" }}
    >
      {/* Video layer */}
      <div
        ref={videoWrapRef}
        className="absolute inset-0 z-0"
        style={{
          clipPath: "inset(12% 22% 12% 22% round 20px)",
          willChange: "clip-path",
        }}
      >
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={videoPoster}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Hero content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center"
        style={{ willChange: "opacity, transform" }}
      >
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {badges.map((badge, i) => (
              <HeroBadge key={i} {...badge} />
            ))}
          </div>
        )}

        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl"
        >
          {headline}
        </h1>

        <p
          ref={sublineRef}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl"
        >
          {subline}
        </p>

        <div className="mt-8 flex items-center gap-2 text-muted-foreground/60 text-sm animate-bounce">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          <span>Scroll to explore</span>
        </div>
      </div>
    </div>
  )
}
