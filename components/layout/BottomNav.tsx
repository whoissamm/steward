"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, MessageCircleIcon, BookOpenIcon, SettingsIcon } from "lucide-react"

const ITEMS = [
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/ask", label: "Ask", Icon: MessageCircleIcon },
  { href: "/learn", label: "Learn", Icon: BookOpenIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
]

const HIDE_ON: string[] = ["/", "/onboard"]

export function BottomNav() {
  const pathname = usePathname()
  if (!pathname) return null
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} aria-hidden strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
