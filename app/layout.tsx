import type { Metadata } from "next"
import "./globals.css"
import { BottomNav } from "@/components/layout/BottomNav"
import { ThemeSync } from "@/components/layout/ThemeSync"

export const metadata: Metadata = {
  title: "Steward — AI advisor for small farms",
  description: "Voice-first AI advisory companion for small farms in England.",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15803d",
}

// Runs synchronously before React hydration to avoid a flash of light theme
// when the user has dark mode / large-text on.
const themeBootstrap = `
try {
  var raw = localStorage.getItem('steward.profile.v1');
  if (raw) {
    var p = JSON.parse(raw);
    if (p && p.dark_mode) document.documentElement.classList.add('dark');
    if (p && p.large_text) document.documentElement.classList.add('large-text');
  }
} catch (e) {}
`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeSync />
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
