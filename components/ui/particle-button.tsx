"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParticleButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

interface Burst {
  id: number;
  particles: Array<{ x: number; y: number; angle: number; distance: number }>;
}

const PARTICLE_COUNT = 10;
const BURST_DURATION_MS = 600;

/**
 * Button that emits 8-12 particles outward on click.
 * Particles are animated with framer-motion opacity + translation.
 * Respects prefers-reduced-motion by skipping the burst.
 */
export function ParticleButton({
  children,
  onClick,
  className,
}: ParticleButtonProps) {
  const [bursts, setBursts] = useState<Burst[]>([]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!reduce) {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const id = Date.now() + Math.random();
        const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.4;
          const distance = 40 + Math.random() * 30;
          return { x: cx, y: cy, angle, distance };
        });
        setBursts((prev) => [...prev, { id, particles }]);
        // Clean up burst after animation completes
        window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== id));
        }, BURST_DURATION_MS + 50);
      }

      onClick?.(e);
    },
    [onClick],
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center justify-center overflow-visible",
        "rounded-xl font-semibold text-white",
        "px-6 py-3.5 min-h-12 min-w-12 text-base",
        "transition-transform active:scale-[0.98]",
        className,
      )}
      style={{ background: "var(--green-700)" }}
    >
      <span className="relative z-10">{children}</span>
      {/* Particle overlay */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      >
        <AnimatePresence>
          {bursts.map((burst) =>
            burst.particles.map((p, i) => (
              <motion.span
                key={`${burst.id}-${i}`}
                className="absolute rounded-full"
                style={{
                  left: p.x,
                  top: p.y,
                  width: 6,
                  height: 6,
                  background: "var(--amber-400)",
                }}
                initial={{ x: -3, y: -3, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(p.angle) * p.distance - 3,
                  y: Math.sin(p.angle) * p.distance - 3,
                  opacity: 0,
                  scale: 0.4,
                }}
                transition={{ duration: BURST_DURATION_MS / 1000, ease: "easeOut" }}
              />
            )),
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
