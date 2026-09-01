"use client"

import { cn } from "@/lib/utils"

export function BorderBeam({
  className,
  size = 200,
  duration = 8,
  colorFrom = "var(--amber-400)",
  colorTo = "var(--green-600)",
}: {
  className?: string
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden", className)}
      aria-hidden
      style={{
        // Two-layer trick: outer clip to inherit radius; inner rotating gradient
        WebkitMaskImage:
          "linear-gradient(#000, #000), linear-gradient(#000, #000)",
        maskImage: "linear-gradient(#000, #000), linear-gradient(#000, #000)",
      }}
    >
      <div
        className="absolute rounded-full opacity-70"
        style={{
          width: size,
          height: size,
          top: "-50%",
          left: "-50%",
          background: `conic-gradient(from 0deg, transparent 0%, ${colorFrom} 20%, ${colorTo} 40%, transparent 60%)`,
          animation: `border-beam-spin ${duration}s linear infinite`,
        }}
      />
      <style>{`
        @keyframes border-beam-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*='border-beam-spin'] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
