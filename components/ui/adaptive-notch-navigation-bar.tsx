"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
}

export interface AdaptiveNotchNavProps {
  leftItems?: NavItem[]
  centerItems?: NavItem[]
  rightItems?: NavItem[]
  logo?: React.ReactNode
  mobileItems?: NavItem[]
  className?: string
}

function Island({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-3 py-2 rounded-full",
        "bg-background/80 backdrop-blur-xl border border-border/60",
        "shadow-[0_2px_20px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {children}
    </div>
  )
}

function NavLink({ item }: { item: NavItem }) {
  return (
    <a
      href={item.href}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        item.active
          ? "bg-primary text-primary-foreground"
          : "text-foreground/80 hover:text-foreground"
      )}
    >
      {item.icon && <span className="w-4 h-4">{item.icon}</span>}
      {item.label}
    </a>
  )
}

function MobileDrawer({
  items,
  open,
  onClose,
}: {
  items: NavItem[]
  open: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-3xl px-4 pb-8 pt-4 shadow-2xl"
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
            <nav className="flex flex-col gap-1">
              {items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                  {item.label}
                </a>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function AdaptiveNotchNavigationBar({
  leftItems = [],
  centerItems = [],
  rightItems = [],
  logo,
  mobileItems,
  className,
}: AdaptiveNotchNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const allMobileItems = mobileItems ?? [...leftItems, ...centerItems, ...rightItems]

  // Close drawer on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      {/* Desktop nav */}
      <nav
        className={cn(
          "fixed top-4 left-0 right-0 z-50 hidden md:flex items-center justify-center px-4 gap-3",
          className
        )}
        aria-label="Main navigation"
      >
        {/* Left island */}
        {(leftItems.length > 0 || logo) && (
          <Island>
            {logo && <span className="mr-1">{logo}</span>}
            {leftItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </Island>
        )}

        {/* Center island */}
        {centerItems.length > 0 && (
          <Island>
            {centerItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </Island>
        )}

        {/* Right island */}
        {rightItems.length > 0 && (
          <Island>
            {rightItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </Island>
        )}
      </nav>

      {/* Mobile nav bar */}
      <div
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 md:hidden",
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/60 shadow-xl">
          {logo ?? (
            <span className="font-semibold text-foreground text-sm">Menu</span>
          )}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        items={allMobileItems}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  )
}
