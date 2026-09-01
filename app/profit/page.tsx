"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useProfile } from "@/hooks/useProfile"
import { hasOnboarded, totalNetProfit, type ProfitEntry } from "@/lib/profile"
import { StatWidget } from "@/components/ui/stat-widget"
import { AiPromptBox } from "@/components/ui/ai-prompt-box"
import { AnimatePresence, motion } from "framer-motion"
import {
  TrendingUpIcon, TrendingDownIcon, PiggyBankIcon, PlusIcon, TrashIcon,
  SparklesIcon, PoundSterlingIcon,
} from "lucide-react"

const KINDS: { id: ProfitEntry["kind"]; label: string; icon: typeof TrendingUpIcon; tone: "green" | "red" | "amber" }[] = [
  { id: "sale", label: "Sale / income", icon: TrendingUpIcon, tone: "green" },
  { id: "cost", label: "Cost / spend", icon: TrendingDownIcon, tone: "red" },
  { id: "saving", label: "Saving (auto or manual)", icon: PiggyBankIcon, tone: "amber" },
]

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function ProfitPage() {
  const router = useRouter()
  const { profile, loaded, update } = useProfile()
  const [addOpen, setAddOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [kind, setKind] = useState<ProfitEntry["kind"]>("sale")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) router.replace("/login")
  }, [loaded, profile, router])

  const entries = profile.profit_entries
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const monthEntries = useMemo(() => entries.filter((e) => e.date.startsWith(monthKey)), [entries, monthKey])

  const totalMonth = totalNetProfit(monthEntries)
  const salesMonth = monthEntries.filter((e) => e.kind === "sale").reduce((s, e) => s + e.amount, 0)
  const costsMonth = monthEntries.filter((e) => e.kind === "cost").reduce((s, e) => s + e.amount, 0)
  const savingsMonth = monthEntries.filter((e) => e.kind === "saving").reduce((s, e) => s + e.amount, 0)

  function addEntry(customNote?: string) {
    const value = parseFloat(amount)
    if (Number.isNaN(value) || value <= 0) return
    const entry: ProfitEntry = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: todayIso(),
      kind,
      amount: Math.round(value * 100) / 100,
      note: (customNote ?? note).trim() || undefined,
      source: "manual",
    }
    update({ profit_entries: [entry, ...entries] })
    setAmount("")
    setNote("")
    setAddOpen(false)
  }

  function removeEntry(id: string) {
    update({ profit_entries: entries.filter((e) => e.id !== id) })
  }

  if (!loaded) {
    return <main className="screen"><p className="text-sm text-[color:var(--muted)]">Loading…</p></main>
  }

  return (
    <main className="screen">
      <header className="flex items-center justify-between">
        <div>
          <p className="sec">Profit</p>
          <h1 className="text-2xl font-bold">
            {totalMonth >= 0 ? `£${totalMonth.toFixed(0)}` : `−£${Math.abs(totalMonth).toFixed(0)}`}
          </h1>
          <p className="text-[color:var(--muted)] text-sm">Net this month</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setAddOpen(true)}>
          <PlusIcon size={16} aria-hidden /> Log
        </button>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <StatWidget icon={TrendingUpIcon} label="Sales" value={`£${salesMonth.toFixed(0)}`} tone="green" />
        <StatWidget icon={TrendingDownIcon} label="Costs" value={`£${costsMonth.toFixed(0)}`} tone="red" />
        <StatWidget icon={PiggyBankIcon} label="Savings" value={`£${savingsMonth.toFixed(0)}`} tone="amber" />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="sec !mb-0">Recent entries</p>
          <Link href="/agents/market" className="text-xs text-[color:var(--green-700)] font-semibold flex items-center gap-1">
            <SparklesIcon size={11} aria-hidden /> Ask Market Guide
          </Link>
        </div>
        {entries.length === 0 ? (
          <div className="card card-tight text-sm text-[color:var(--muted)]">
            No entries yet. Tap Log to add a sale, cost or saving.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.slice(0, 12).map((e) => {
              const isPos = e.kind === "sale" || e.kind === "saving"
              return (
                <li key={e.id} className="card card-tight flex items-center gap-3">
                  <span
                    className={
                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 " +
                      (isPos
                        ? "bg-[color:color-mix(in_oklab,var(--green-500)_15%,var(--surface))] text-[color:var(--green-700)]"
                        : "bg-[color:color-mix(in_oklab,var(--red-500)_15%,var(--surface))] text-[color:var(--red-600)]")
                    }
                  >
                    <PoundSterlingIcon size={16} aria-hidden />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      {isPos ? "+" : "−"}£{e.amount.toFixed(2)}
                      <span className="text-[color:var(--muted)] font-normal ml-2">{e.kind}</span>
                    </p>
                    <p className="text-xs text-[color:var(--muted)]">
                      {new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      {e.note ? ` · ${e.note}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost !p-1.5"
                    onClick={() => removeEntry(e.id)}
                    aria-label={`Remove entry`}
                  >
                    <TrashIcon size={14} aria-hidden />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/50"
            onClick={() => setAddOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="card w-full max-w-md flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="sec">Log an entry</p>
              <div className="grid grid-cols-3 gap-2">
                {KINDS.map((k) => {
                  const Icon = k.icon
                  const sel = kind === k.id
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setKind(k.id)}
                      className={
                        "flex flex-col items-center gap-1 p-2 rounded-xl border-2 " +
                        (sel
                          ? "border-[color:var(--green-700)] bg-[color:color-mix(in_oklab,var(--green-500)_8%,var(--surface))]"
                          : "border-[color:var(--border)]")
                      }
                    >
                      <Icon size={16} className={sel ? "text-[color:var(--green-700)]" : "text-[color:var(--muted)]"} aria-hidden />
                      <span className="text-[11px] font-medium text-center leading-tight">
                        {k.label.split(" / ")[0]}
                      </span>
                    </button>
                  )
                })}
              </div>
              <label className="flex flex-col gap-1 text-sm">
                Amount (£)
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Note (optional)
                <input
                  type="text"
                  className="input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Farm shop weekend"
                />
              </label>
              <div className="flex gap-2">
                <button type="button" className="btn-primary flex-1" onClick={() => addEntry()}>
                  Save
                </button>
                <button type="button" className="btn-ghost" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
