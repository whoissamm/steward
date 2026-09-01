"use client";

import { motion, useReducedMotion } from "framer-motion";

interface DotLoaderProps {
  count?: number;
  color?: string;
}

/**
 * Sequentially bouncing dots for inline "loading" states.
 * Uses framer-motion staggered animation with 100ms delay per dot.
 */
export function DotLoader({ count = 5, color }: DotLoaderProps) {
  const reduce = useReducedMotion();
  const dotColor = color ?? "var(--green-700)";

  return (
    <span
      className="inline-flex items-end gap-1 align-middle"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="inline-block rounded-full"
          style={{ width: 6, height: 6, backgroundColor: dotColor }}
          animate={reduce ? { y: 0, opacity: 0.7 } : { y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }
          }
        />
      ))}
    </span>
  );
}
