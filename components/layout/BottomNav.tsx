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

const HIDE_ON: string[] = ["/", "/login", "/onboard", "/agents/"]

export function BottomNav() {
  const pathname = usePathname()
  if (!pathname) return null
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/") || (p.endsWith("/") && pathname.startsWith(p)))) return null

  return (
    <Dock>
      {ITEMS.map(({ href, label, icon }) => {
        const active =
          pathname === href ||
          (href === "/agents" && (pathname === "/ask" || pathname.startsWith("/agents/")))
        return <DockItem key={href} href={href} label={label} icon={icon} active={active} />
      })}
    </Dock>
  )
}
