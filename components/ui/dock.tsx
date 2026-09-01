"use client";

import Link from "next/link";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DockProps {
  children: ReactNode;
  className?: string;
}

interface DockItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: boolean;
}

interface InternalDockItemProps extends DockItemProps {
  mouseX?: MotionValue<number>;
  touchMode?: boolean;
}

const BASE_SIZE = 48;
const PEAK_SIZE = 64;
const PEAK_RANGE = 80;
const OUTER_RANGE = 200;

export function Dock({ children, className }: DockProps) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const [touchMode, setTouchMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setTouchMode(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    mouseX.set(event.clientX);
  };

  const handleMouseLeave = () => {
    mouseX.set(Number.POSITIVE_INFINITY);
  };

  const enhanced = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    // Only enhance DockItem children; pass through mouseX
    return cloneElement(child as ReactElement<InternalDockItemProps>, {
      mouseX: touchMode ? undefined : mouseX,
      touchMode,
    });
  });

  return (
    <div
      onMouseMove={touchMode ? undefined : handleMouseMove}
      onMouseLeave={touchMode ? undefined : handleMouseLeave}
      className={cn(
        "mx-auto flex items-end gap-2 rounded-full px-3 py-2",
        "border backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
        className,
      )}
      style={{
        background: "color-mix(in oklab, var(--surface) 70%, transparent)",
        borderColor: "var(--border)",
      }}
      role="toolbar"
      aria-label="Dock"
    >
      {enhanced}
    </div>
  );
}

export function DockItem({
  icon: Icon,
  label,
  href,
  onClick,
  active,
  badge,
  mouseX,
  touchMode,
}: InternalDockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useMotionValue(OUTER_RANGE + 1);

  useEffect(() => {
    if (!mouseX || touchMode) return;
    const unsub = mouseX.on("change", (x) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      distance.set(Math.abs(x - centerX));
    });
    return unsub;
  }, [mouseX, distance, touchMode]);

  // Peak scale ~1.35 within 80px, taper to 1 at 200px, hold peak inside PEAK_RANGE.
  const size = useTransform(distance, [0, PEAK_RANGE, OUTER_RANGE], [PEAK_SIZE, PEAK_SIZE, BASE_SIZE]);
  const springSize = useSpring(size, { mass: 0.1, stiffness: 220, damping: 20 });

  const staticSize = BASE_SIZE;

  const commonClass = cn(
    "relative flex items-center justify-center rounded-2xl",
    "transition-colors duration-200",
    active
      ? "text-white"
      : "text-[color:var(--fg)] hover:text-[color:var(--green-700)]",
  );

  const bgStyle = {
    background: active
      ? "var(--green-700)"
      : "color-mix(in oklab, var(--surface) 85%, transparent)",
    boxShadow: active ? "0 4px 14px rgba(21,128,61,0.35)" : undefined,
  } as const;

  const iconSize = touchMode ? 22 : undefined;

  const content = (
    <>
      <Icon
        aria-hidden="true"
        style={touchMode ? { width: 22, height: 22 } : { width: "50%", height: "50%" }}
        width={iconSize}
        height={iconSize}
      />
      {badge ? (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full ring-2"
          style={{ background: "var(--red-500)", boxShadow: "0 0 0 2px var(--surface)" }}
        />
      ) : null}
      <span className="sr-only">{label}</span>
    </>
  );

  const inner = touchMode ? (
    <div
      ref={ref}
      className={commonClass}
      style={{ width: staticSize, height: staticSize, ...bgStyle }}
      aria-label={label}
      title={label}
    >
      {content}
    </div>
  ) : (
    <motion.div
      ref={ref}
      className={commonClass}
      style={{ width: springSize, height: springSize, ...bgStyle }}
      aria-label={label}
      title={label}
    >
      {content}
    </motion.div>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className="inline-flex items-end"
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active ? true : undefined}
      className="inline-flex items-end bg-transparent p-0"
    >
      {inner}
    </button>
  );
}

export type { DockProps, DockItemProps };
// Re-export type helper for consumers that spread props on DockItem
export type DockItemComponentProps = ComponentProps<typeof DockItem>;
