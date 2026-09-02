"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { HomeIcon, MessageCircleIcon, BookOpenIcon, CalendarDaysIcon, SettingsIcon, SproutIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/agents", label: "Agents", Icon: MessageCircleIcon },
  { href: "/calendar", label: "Calendar", Icon: CalendarDaysIcon },
  { href: "/learn", label: "Learn", Icon: BookOpenIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
]

const HIDE_EXACT = new Set(["/", "/login", "/onboard"])
const HIDE_PREFIX = ["/agents/"]

export function TopNav() {
  const pathname = usePathname()
  if (!pathname) return null
  if (HIDE_EXACT.has(pathname)) return null
  if (HIDE_PREFIX.some((p) => pathname.startsWith(p))) return null

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b border-[color:var(--border)]"
      style={{
        background: "color-mix(in oklab, var(--bg) 78%, transparent)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <nav className="max-w-3xl mx-auto flex items-center gap-1 px-3 py-2" aria-label="Primary">
        <Link href="/home" className="flex items-center gap-2 pr-2 mr-1 border-r border-[color:var(--border)]">
          <span className="w-7 h-7 rounded-lg bg-[color:var(--green-700)] text-white flex items-center justify-center">
            <SproutIcon size={14} aria-hidden />
          </span>
          <span className="text-sm font-bold hidden sm:inline">Steward</span>
        </Link>
        <div className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium flex-shrink-0",
                  active ? "text-[color:var(--green-700)]" : "text-[color:var(--muted)] hover:text-[color:var(--fg)]",
                )}
              >
                <Icon size={15} aria-hidden strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
                {active && (
                  <motion.span
                    layoutId="topnav-active-pill"
                    className="absolute inset-0 rounded-lg -z-10"
                    style={{ background: "color-mix(in oklab, var(--green-500) 12%, transparent)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
