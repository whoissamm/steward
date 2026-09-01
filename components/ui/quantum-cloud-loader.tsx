"use client"

import { cn } from "@/lib/utils"

export interface QuantumCloudLoaderProps {
  size?: number
  label?: string
  hideLabel?: boolean
  className?: string
}

const PARTICLES = [
  { color: "#6366f1", delay: "0s", axis: "0deg" },
  { color: "#8b5cf6", delay: "-0.6s", axis: "72deg" },
  { color: "#ec4899", delay: "-1.2s", axis: "144deg" },
  { color: "#06b6d4", delay: "-1.8s", axis: "216deg" },
  { color: "#10b981", delay: "-2.4s", axis: "288deg" },
]

export function QuantumCloudLoader({
  size = 80,
  label = "Loading…",
  hideLabel = false,
  className,
}: QuantumCloudLoaderProps) {
  const orbitSize = size
  const particleSize = size * 0.14
  const coreSize = size * 0.36
  const duration = "3s"

  return (
    <div
      className={cn("flex flex-col items-center gap-4", className)}
      role="status"
      aria-label={label}
    >
      <div
        className="relative"
        style={{ width: orbitSize, height: orbitSize }}
      >
        {/* Core sphere */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: coreSize,
            height: coreSize,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle at 35% 35%, #a78bfa, #6366f1 50%, #312e81)",
            boxShadow: "0 0 24px 8px rgba(99,102,241,0.4)",
            animationDuration: "1.5s",
          }}
        />

        {/* Orbiting particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transform: `rotateZ(${p.axis}) rotateX(70deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                animation: `quantum-orbit ${duration} linear infinite`,
                animationDelay: p.delay,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "0%",
                  left: "50%",
                  width: particleSize,
                  height: particleSize,
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  transform: "translate(-50%, -50%)",
                  boxShadow: `0 0 ${particleSize * 1.5}px ${particleSize * 0.6}px ${p.color}80`,
                }}
              />
            </div>
          </div>
        ))}

        {/* Ring outlines */}
        {PARTICLES.map((p, i) => (
          <div
            key={`ring-${i}`}
            className="absolute inset-0 rounded-full border opacity-20"
            style={{
              borderColor: p.color,
              transform: `rotateZ(${p.axis}) rotateX(70deg)`,
              borderWidth: 1,
            }}
          />
        ))}
      </div>

      {!hideLabel && (
        <span className="text-sm text-muted-foreground animate-pulse font-medium">
          {label}
        </span>
      )}

      <style jsx global>{`
        @keyframes quantum-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
