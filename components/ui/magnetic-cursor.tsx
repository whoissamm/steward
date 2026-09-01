"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * A small green dot that follows the pointer with spring physics.
 * - Enlarges over elements with data-cursor="hover"
 * - Never hides the OS cursor
 * - Skips render entirely on touch devices (no hover:hover match)
 * - No-op if prefers-reduced-motion is enabled
 */
export function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { damping: 20, stiffness: 300, mass: 0.4 });
  const sy = useSpring(y, { damping: 20, stiffness: 300, mass: 0.4 });

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
      const hoverTarget = target?.closest('[data-cursor="hover"]');
      setHovering(Boolean(hoverTarget));
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [x, y]);

  if (!enabled) return null;

  const base = 10;
  const size = hovering ? 28 : base;

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
        background: "var(--green-700)",
        opacity: hovering ? 0.35 : 0.75,
        transition: "width 150ms ease, height 150ms ease, opacity 150ms ease, margin 150ms ease",
      }}
    />
  );
}
