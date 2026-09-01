"use client";

import { cn } from "@/lib/utils";

interface ShimmerLoaderProps {
  lines?: number;
  className?: string;
}

/**
 * Polished skeleton lines with a gradient sweep. This is a fresh variant
 * that doesn't rely on the global .skeleton class — inline keyframes keep
 * it self-contained. Respects prefers-reduced-motion.
 */
export function ShimmerLoader({ lines = 3, className }: ShimmerLoaderProps) {
  return (
    <div
      className={cn("flex w-full flex-col gap-3", className)}
      role="status"
      aria-label="Loading content"
    >
      <style>{`
        @keyframes steward-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .steward-shimmer-line { animation: none !important; }
        }
      `}</style>
      {Array.from({ length: lines }).map((_, i) => {
        // Vary width slightly per line for a natural text-block look
        const width = i === lines - 1 ? "60%" : i % 2 === 0 ? "100%" : "88%";
        return (
          <div
            key={i}
            className="steward-shimmer-line rounded-md"
            style={{
              height: 12,
              width,
              backgroundImage:
                "linear-gradient(90deg, var(--surface-alt) 0%, var(--border) 40%, var(--surface-alt) 80%)",
              backgroundSize: "200% 100%",
              animation: "steward-shimmer 1.6s ease-in-out infinite",
            }}
          />
        );
      })}
    </div>
  );
}
