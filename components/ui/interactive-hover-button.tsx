"use client";

import { ArrowRight } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  arrow?: boolean;
}

/**
 * Premium hover button. On hover:
 *  - the label slides left and fades
 *  - a green pill grows from the right edge to fill the button
 *  - an arrow rides in from the right
 * Base sizing matches .btn-primary (48 min-height, 12px radius).
 */
export function InteractiveHoverButton({
  children,
  onClick,
  className,
  arrow = true,
}: InteractiveHoverButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative isolate inline-flex items-center justify-center overflow-hidden",
        "rounded-xl border font-semibold",
        "px-6 py-3.5 min-h-12 min-w-12 text-base",
        "transition-colors duration-200",
        className,
      )}
      style={{
        background: "var(--surface)",
        color: "var(--fg)",
        borderColor: "var(--border)",
      }}
    >
      {/* Expanding green pill from right */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-0 top-0 h-full",
          "w-0 rounded-xl transition-[width] duration-300 ease-out",
          "group-hover:w-full",
        )}
        style={{ background: "var(--green-700)" }}
      />

      {/* Label — slides left on hover */}
      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-2",
          "transition-all duration-300 ease-out",
          "group-hover:-translate-x-2 group-hover:opacity-0",
        )}
      >
        {children}
      </span>

      {/* Arrow — rides in from right on hover */}
      {arrow && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center gap-2 text-white",
            "translate-x-3 opacity-0 transition-all duration-300 ease-out",
            "group-hover:translate-x-0 group-hover:opacity-100",
          )}
        >
          <span className="font-semibold">{children}</span>
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
