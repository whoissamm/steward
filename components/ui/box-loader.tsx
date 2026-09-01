"use client";

import { motion, useReducedMotion } from "framer-motion";

interface BoxLoaderProps {
  size?: number;
}

/**
 * Stack of 4 boxes shuffling — visual metaphor for "processing farm data".
 * Alternates amber/green to keep the Steward palette front-and-centre.
 */
export function BoxLoader({ size = 32 }: BoxLoaderProps) {
  const reduce = useReducedMotion();
  const boxes = [0, 1, 2, 3];
  const gap = 4;
  const stackHeight = size * boxes.length + gap * (boxes.length - 1);

  return (
    <div
      className="relative"
      style={{ width: size, height: stackHeight }}
      role="status"
      aria-label="Processing farm data"
    >
      {boxes.map((i) => {
        const restingY = i * (size + gap);
        const isAmber = i % 2 === 0;
        return (
          <motion.div
            key={i}
            className="absolute left-0 rounded-md"
            style={{
              width: size,
              height: size,
              background: isAmber ? "var(--amber-400)" : "var(--green-700)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
            }}
            initial={{ y: restingY, x: 0 }}
            animate={
              reduce
                ? { y: restingY, x: 0, rotate: 0 }
                : {
                    y: [restingY, restingY - size * 0.4, restingY],
                    x: [0, size * 0.5, 0],
                    rotate: [0, 8, 0],
                  }
            }
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }
            }
          />
        );
      })}
    </div>
  );
}
