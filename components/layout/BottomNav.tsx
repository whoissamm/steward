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
 * Primary navigation — the macOS-style magnifying Dock, pinned to the TOP
 * of every product page. Agent message dock lives at the BOTTOM.
 * (Name is BottomNav for backwards compat with the import graph.)
 */
export function BottomNav() {
  const pathname = usePathname()
  if (!pathname) return null
  if (HIDE_EXACT.has(pathname)) return null
  if (HIDE_PREFIX.some((p) => pathname.startsWith(p))) return null

  return (
    <div
      className="fixed left-0 right-0 z-40 pointer-events-none px-3"
      style={{ top: `calc(env(safe-area-inset-top, 0px) + 12px)` }}
    >
      <div className="pointer-events-auto flex justify-center">
        <Dock>
          {ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href || (href === "/agents" && pathname === "/ask")
            return <DockItem key={href} href={href} label={label} icon={icon} active={active} />
          })}
        </Dock>
      </div>
    </div>
  )
}
