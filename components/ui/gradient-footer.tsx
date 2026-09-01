"use client"

import Link from "next/link"
import { SproutIcon, ExternalLinkIcon } from "lucide-react"

export function GradientFooter() {
  return (
    <footer
      className="w-full mt-12 text-[color:var(--stone-100)]"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--green-900) 92%, transparent) 0%, var(--stone-900) 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <SproutIcon size={22} className="text-[color:var(--amber-400)]" aria-hidden />
            <span className="text-lg font-bold text-white">Steward</span>
          </div>
          <p className="text-sm text-[color:var(--stone-300)] leading-relaxed">
            The voice-first farm companion for small farms in England.
          </p>
          <p className="text-xs text-[color:var(--stone-500)] mt-1">v1.0 · Built with care</p>
        </section>
        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--amber-400)]">Steward</p>
          <Link href="/home" className="text-sm hover:text-[color:var(--amber-400)] transition-colors">Dashboard</Link>
          <Link href="/agents" className="text-sm hover:text-[color:var(--amber-400)] transition-colors">Talk to an agent</Link>
          <Link href="/learn" className="text-sm hover:text-[color:var(--amber-400)] transition-colors">Learn the course</Link>
          <Link href="/settings" className="text-sm hover:text-[color:var(--amber-400)] transition-colors">Settings</Link>
        </section>
        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--amber-400)]">Trusted sources</p>
          <a href="https://www.gov.uk/browse/environment-countryside/rural-country" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 hover:text-[color:var(--amber-400)] transition-colors">
            GOV.UK farming <ExternalLinkIcon size={11} aria-hidden />
          </a>
          <a href="https://ahdb.org.uk" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 hover:text-[color:var(--amber-400)] transition-colors">
            AHDB <ExternalLinkIcon size={11} aria-hidden />
          </a>
          <a href="https://www.metoffice.gov.uk/services/agriculture" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 hover:text-[color:var(--amber-400)] transition-colors">
            Met Office farming <ExternalLinkIcon size={11} aria-hidden />
          </a>
          <a href="https://fcn.org.uk" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 hover:text-[color:var(--amber-400)] transition-colors">
            Farming Community Network <ExternalLinkIcon size={11} aria-hidden />
          </a>
        </section>
      </div>
      <div className="border-t border-white/10">
        <p className="max-w-4xl mx-auto px-6 py-4 text-xs text-[color:var(--stone-400)] text-center">
          Steward is a decision aid for small farms in England, not a licensed adviser. For regulated
          decisions (vet, pesticide, disposal), speak to a qualified professional.
        </p>
      </div>
    </footer>
  )
}
