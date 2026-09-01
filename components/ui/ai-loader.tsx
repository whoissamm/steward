"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AiLoaderProps {
  label?: string;
  size?: number;
}

/**
 * Pulsing gradient core with 3 orbiting dots. Intended for AI-processing
 * moments (e.g. Steward is thinking about your paddock question).
 */
export function AiLoader({ label, size = 64 }: AiLoaderProps) {
  const reduce = useReducedMotion();
  const orbitRadius = size * 0.55;
  const dotSize = Math.max(6, Math.round(size * 0.12));

  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div
        className="relative"
        style={{ width: size * 1.6, height: size * 1.6 }}
      >
        {/* Pulsing gradient core */}
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            background:
              "radial-gradient(circle at 30% 30%, var(--amber-400), var(--green-700) 75%)",
            boxShadow: "0 0 24px rgba(21, 128, 61, 0.35)",
          }}
          animate={
            reduce ? { scale: 1, opacity: 0.9 } : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
        />

        {/* 3 orbiting dots — each on its own rotating layer, offset by phase */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              width: 0,
              height: 0,
            }}
            animate={reduce ? { rotate: i * 120 } : { rotate: 360 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: -(i * 0.8), // negative delay = staggered phase start
                  }
            }
          >
            <span
              className="absolute rounded-full"
              style={{
                width: dotSize,
                height: dotSize,
                left: orbitRadius - dotSize / 2,
                top: -dotSize / 2,
                background: i === 0 ? "var(--amber-400)" : "var(--green-700)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {label && (
        <p
          className={cn("italic text-sm")}
          style={{ color: "var(--muted)" }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
