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

const HIDE_EXACT = new Set(["/", "/login", "/onboard"])
const HIDE_PREFIX = ["/agents/"]

/**
 * Mobile-only bottom nav. On desktop (sm+) we show TopNav instead so the
 * bottom zone belongs to the AgentMessageDock (chat is more-used than nav
 * on this app).
 */
export function BottomNav() {
  const pathname = usePathname()
  if (!pathname) return null
  if (HIDE_EXACT.has(pathname)) return null
  if (HIDE_PREFIX.some((p) => pathname.startsWith(p))) return null

  return (
    <div className="sm:hidden">
      <Dock>
        {ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || (href === "/agents" && pathname === "/ask")
          return <DockItem key={href} href={href} label={label} icon={icon} active={active} />
        })}
      </Dock>
    </div>
  )
}
