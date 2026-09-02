/**
 * Hand-crafted 40x40 agent brand icons. Each is a circular badge with a
 * multi-colour illustrated glyph — natural, warm, studio-agency look.
 * The circle fill IS the icon background (no separate wrapper needed).
 */

type IconProps = { size?: number; className?: string; noBackground?: boolean }

// ---------- Joseph — steward / sprout ----------
export function JosephIcon({ size = 40, className, noBackground }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      {!noBackground && <circle cx="20" cy="20" r="20" fill="#166534" />}
      {/* Ground */}
      <path d="M6 32 Q20 30, 34 32 L34 34 Q20 32.5, 6 34 Z" fill="#7c2d12" opacity="0.65" />
      {/* Left leaf */}
      <path d="M20 24 C 20 14, 12 10, 8 12 C 8 20, 14 24, 20 24 Z" fill="#4ade80" />
      {/* Right leaf */}
      <path d="M20 24 C 20 14, 28 10, 32 12 C 32 20, 26 24, 20 24 Z" fill="#22c55e" />
      {/* Leaf veins */}
      <path d="M20 24 Q 15 18, 10 14" stroke="#166534" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M20 24 Q 25 18, 30 14" stroke="#166534" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Stem */}
      <rect x="19" y="22" width="2" height="10" rx="1" fill="#fde68a" />
    </svg>
  )
}

// ---------- Ken — weather (sun + cloud) ----------
export function KenIcon({ size = 40, className, noBackground }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      {!noBackground && <circle cx="20" cy="20" r="20" fill="#0369a1" />}
      {/* Sun rays */}
      <g stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round">
        <line x1="13" y1="6" x2="13" y2="9" />
        <line x1="6" y1="14" x2="9" y2="14" />
        <line x1="20" y1="14" x2="17" y2="14" />
        <line x1="8.5" y1="8.5" x2="10.5" y2="10.5" />
        <line x1="17.5" y1="8.5" x2="15.5" y2="10.5" />
      </g>
      {/* Sun body */}
      <circle cx="13" cy="14" r="4" fill="#fcd34d" />
      <circle cx="13" cy="14" r="3" fill="#fbbf24" />
      {/* Cloud */}
      <path
        d="M11 27
           a 5 5 0 0 1 4 -6
           a 6 6 0 0 1 11 1
           a 4 4 0 0 1 1 8
           H 12
           a 4 4 0 0 1 -1 -3 Z"
        fill="#f8fafc"
      />
      <path
        d="M11 27
           a 5 5 0 0 1 4 -6
           a 6 6 0 0 1 11 1
           a 4 4 0 0 1 1 8
           H 12
           a 4 4 0 0 1 -1 -3 Z"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="0.6"
      />
      {/* Rain drops */}
      <circle cx="15" cy="33" r="1" fill="#38bdf8" />
      <circle cx="20" cy="34" r="1" fill="#38bdf8" />
      <circle cx="25" cy="33" r="1" fill="#38bdf8" />
    </svg>
  )
}

// ---------- Grace — grants (bank/document) ----------
export function GraceIcon({ size = 40, className, noBackground }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      {!noBackground && <circle cx="20" cy="20" r="20" fill="#6d28d9" />}
      {/* Building base */}
      <rect x="8" y="30" width="24" height="2.5" rx="0.5" fill="#fde68a" />
      {/* Columns */}
      <rect x="10" y="18" width="3" height="12" fill="#f5f5f4" />
      <rect x="15.5" y="18" width="3" height="12" fill="#f5f5f4" />
      <rect x="21.5" y="18" width="3" height="12" fill="#f5f5f4" />
      <rect x="27" y="18" width="3" height="12" fill="#f5f5f4" />
      {/* Frieze */}
      <rect x="8" y="15" width="24" height="3" rx="0.5" fill="#f5f5f4" />
      {/* Roof */}
      <path d="M6 15 L20 6 L34 15 Z" fill="#fbbf24" />
      <path d="M6 15 L20 6 L34 15 Z" fill="none" stroke="#b45309" strokeWidth="0.6" />
      {/* Coin accent */}
      <circle cx="20" cy="24" r="3.2" fill="#fbbf24" />
      <text x="20" y="26.5" fontSize="5" fontWeight="700" textAnchor="middle" fill="#7c2d12">£</text>
    </svg>
  )
}

// ---------- Tom — soil doctor (wheat / earth) ----------
export function TomIcon({ size = 40, className, noBackground }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      {!noBackground && <circle cx="20" cy="20" r="20" fill="#78350f" />}
      {/* Soil rows */}
      <path d="M4 30 Q 20 27, 36 30 L 36 34 Q 20 31, 4 34 Z" fill="#1c1917" opacity="0.35" />
      {/* Wheat stalk stem */}
      <path d="M20 30 L 20 12" stroke="#fef3c7" strokeWidth="1.2" strokeLinecap="round" />
      {/* Wheat kernels — left side */}
      <ellipse cx="17" cy="14" rx="2" ry="3" fill="#fbbf24" transform="rotate(-25 17 14)" />
      <ellipse cx="16" cy="18" rx="2" ry="3" fill="#fbbf24" transform="rotate(-25 16 18)" />
      <ellipse cx="15" cy="22" rx="2" ry="3" fill="#f59e0b" transform="rotate(-25 15 22)" />
      {/* Wheat kernels — right side */}
      <ellipse cx="23" cy="14" rx="2" ry="3" fill="#fbbf24" transform="rotate(25 23 14)" />
      <ellipse cx="24" cy="18" rx="2" ry="3" fill="#fbbf24" transform="rotate(25 24 18)" />
      <ellipse cx="25" cy="22" rx="2" ry="3" fill="#f59e0b" transform="rotate(25 25 22)" />
      {/* Wheat kernels — centre */}
      <ellipse cx="20" cy="12" rx="1.6" ry="2.5" fill="#fbbf24" />
      <ellipse cx="20" cy="16" rx="1.6" ry="2.5" fill="#fbbf24" />
      <ellipse cx="20" cy="20" rx="1.6" ry="2.5" fill="#f59e0b" />
      {/* Base leaf */}
      <path d="M20 30 Q 12 26, 8 30" stroke="#22c55e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M20 30 Q 28 26, 32 30" stroke="#22c55e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ---------- Beth — vet bridge (stethoscope + heart) ----------
export function BethIcon({ size = 40, className, noBackground }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      {!noBackground && <circle cx="20" cy="20" r="20" fill="#b91c1c" />}
      {/* Stethoscope tubing */}
      <path
        d="M11 8 Q 11 20, 20 22 Q 29 20, 29 8"
        stroke="#f5f5f4"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Earpieces */}
      <circle cx="11" cy="8" r="2" fill="#f5f5f4" />
      <circle cx="29" cy="8" r="2" fill="#f5f5f4" />
      {/* Bell */}
      <circle cx="20" cy="27" r="5" fill="#f5f5f4" />
      <circle cx="20" cy="27" r="3" fill="#dc2626" />
      {/* Little heart on the bell */}
      <path
        d="M20 28.2 c -1 -1.4 -2.6 -0.6 -2.6 0.8 c 0 1 1.6 2.2 2.6 3 c 1 -0.8 2.6 -2 2.6 -3 c 0 -1.4 -1.6 -2.2 -2.6 -0.8 Z"
        fill="#fef2f2"
      />
    </svg>
  )
}

// ---------- Kim — market / farm shop ----------
export function KimIcon({ size = 40, className, noBackground }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      {!noBackground && <circle cx="20" cy="20" r="20" fill="#c2410c" />}
      {/* Shop body */}
      <rect x="8" y="18" width="24" height="14" fill="#fef3c7" />
      {/* Roof */}
      <path d="M6 18 L 20 8 L 34 18 Z" fill="#dc2626" />
      <path d="M6 18 L 20 8 L 34 18 Z" fill="none" stroke="#7f1d1d" strokeWidth="0.6" />
      {/* Awning stripes */}
      <rect x="8" y="18" width="4" height="3" fill="#dc2626" />
      <rect x="16" y="18" width="4" height="3" fill="#dc2626" />
      <rect x="24" y="18" width="4" height="3" fill="#dc2626" />
      {/* Door */}
      <rect x="17" y="23" width="6" height="9" fill="#78350f" />
      <circle cx="21.5" cy="27.5" r="0.4" fill="#fde68a" />
      {/* Windows */}
      <rect x="10" y="23" width="4.5" height="4" fill="#38bdf8" />
      <rect x="25.5" y="23" width="4.5" height="4" fill="#38bdf8" />
      {/* Apple accents */}
      <circle cx="12.25" cy="30" r="1" fill="#16a34a" />
      <circle cx="27.75" cy="30" r="1" fill="#16a34a" />
    </svg>
  )
}

import type { ReactElement } from "react"

export const AGENT_ICON_MAP: Record<string, (props: IconProps) => ReactElement> = {
  steward: JosephIcon,
  weather: KenIcon,
  grants: GraceIcon,
  soil: TomIcon,
  vet_bridge: BethIcon,
  market: KimIcon,
}
