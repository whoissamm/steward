import type { Metadata, Viewport } from "next"
import "./globals.css"
import { TopNav } from "@/components/layout/TopNav"
import { ThemeSync } from "@/components/layout/ThemeSync"
import { PwaRegister } from "@/components/layout/PwaRegister"
import { AgentMessageDock } from "@/components/layout/AgentMessageDock"
import { VerdantSwirl } from "@/components/ui/verdant-swirl"
import { ProfileProvider } from "@/hooks/useProfile"

export const metadata: Metadata = {
  title: "Steward — AI advisor for small farms",
  description: "Voice-first AI advisory companion for small farms in England.",
  applicationName: "Steward",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Steward",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15803d",
  viewportFit: "cover",
}

// Runs synchronously before React hydration to avoid a flash of light theme
const themeBootstrap = `
try {
  var raw = localStorage.getItem('steward.profile.v2') || localStorage.getItem('steward.profile.v1');
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
        <link rel="mask-icon" href="/icons/icon.svg" color="#15803d" />
      </head>
      <body className="min-h-full flex flex-col">
        <ProfileProvider>
          <VerdantSwirl />
          <ThemeSync />
          <PwaRegister />
          <TopNav />
          {children}
          <AgentMessageDock />
        </ProfileProvider>
      </body>
    </html>
  )
}
