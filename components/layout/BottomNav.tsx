"use client"

import { usePathname } from "next/navigation"
import { HomeIcon, MessageCircleIcon, BookOpenIcon, CalendarDaysIcon, SettingsIcon } from "lucide-react"
import { Dock, DockItem } from "@/components/ui/dock"

const ITEMS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/agents", label: "Agents", icon: MessageCircleIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarDaysIcon },
  { href: "/learn", label: "Learn", icon: BookOpenIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
]

// Paths where the dock is hidden. Exact matches only for splash/login/onboard;
// prefix match for individual agent chat pages (they have their own composer).
const HIDE_EXACT = new Set(["/", "/login", "/onboard"])
const HIDE_PREFIX = ["/agents/"] // matches /agents/steward etc., NOT /agents

export function BottomNav() {
  const pathname = usePathname()
  if (!pathname) return null
  if (HIDE_EXACT.has(pathname)) return null
  if (HIDE_PREFIX.some((p) => pathname.startsWith(p))) return null

  return (
    <Dock>
      {ITEMS.map(({ href, label, icon }) => {
        const active =
          pathname === href ||
          (href === "/agents" && pathname === "/ask")
        return <DockItem key={href} href={href} label={label} icon={icon} active={active} />
      })}
    </Dock>
  )
}
