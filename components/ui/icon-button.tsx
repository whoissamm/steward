"use client";

import type { LucideIcon } from "lucide-react";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
}

/**
 * Icon-left + label-right button. Minimum 40px touch target.
 * aria-label falls back to the visible label for screen readers.
 * Uses the global focus ring already applied via app/globals.css.
 */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = "primary",
  className,
}: IconButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 min-h-10 min-w-10 " +
    "rounded-xl px-4 py-2 text-sm font-medium transition-colors " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyle: React.CSSProperties =
    variant === "primary"
      ? { background: "var(--green-700)", color: "#ffffff" }
      : variant === "outline"
        ? {
            background: "var(--surface)",
            color: "var(--fg)",
            border: "1px solid var(--border)",
          }
        : { background: "transparent", color: "var(--muted)" };

  const hoverClass =
    variant === "primary"
      ? "hover:brightness-95"
      : variant === "outline"
        ? "hover:bg-[var(--surface-alt)]"
        : "hover:bg-[var(--surface-alt)] hover:text-[var(--fg)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(base, hoverClass, className)}
      style={variantStyle}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
