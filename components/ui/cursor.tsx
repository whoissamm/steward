"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface CustomCursorProps {
  variant?: "dot" | "ring" | "blend";
}

/**
 * Full-page cursor overlay with 3 variants:
 *  - dot: solid green dot
 *  - ring: hollow ring with green border
 *  - blend: white circle with mix-blend-mode="difference"
 *
 * Guardrails: skips on touch devices, no-op with prefers-reduced-motion,
 * and never hides the OS cursor.
 */
export function CustomCursor({ variant = "dot" }: CustomCursorProps) {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { damping: 25, stiffness: 250, mass: 0.5 });
  const sy = useSpring(y, { damping: 25, stiffness: 250, mass: 0.5 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduce) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest('[data-cursor="hover"]')));
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [x, y]);

  if (!enabled) return null;

  const baseSize = variant === "ring" ? 28 : variant === "blend" ? 30 : 12;
  const size = hovering ? baseSize * 1.6 : baseSize;

  const variantStyle: React.CSSProperties =
    variant === "ring"
      ? {
          background: "transparent",
          border: "2px solid var(--green-700)",
        }
      : variant === "blend"
        ? {
            background: "#ffffff",
            mixBlendMode: "difference",
          }
        : { background: "var(--green-700)" };

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full"
      style={{
        x: sx,
        y: sy,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        transition:
          "width 160ms ease, height 160ms ease, margin 160ms ease, opacity 160ms ease",
        opacity: variant === "blend" ? 1 : hovering ? 0.5 : 0.85,
        ...variantStyle,
      }}
    />
  );
}
