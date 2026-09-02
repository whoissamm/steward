"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowRightIcon } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { nameForAgent, type AgentId } from "@/lib/agent-names"
import { AGENT_ICON_MAP } from "@/components/ui/agent-icons"

const AGENTS: {
  id: AgentId
  role: string
  taglineMale: string
  taglineFemale: string
}[] = [
  { id: "steward",    role: "Your everyday companion", taglineMale: "The friend who knows your farm — start here.",              taglineFemale: "The friend who knows your farm — start here." },
  { id: "weather",    role: "Weather & spray",         taglineMale: "Frost risk, rain windows, safe spray days.",                 taglineFemale: "Frost risk, rain windows, safe spray days." },
  { id: "grants",     role: "Schemes & grants",        taglineMale: "SFI, Countryside Stewardship, deadlines and paperwork.",     taglineFemale: "SFI, Countryside Stewardship, deadlines and paperwork." },
  { id: "soil",       role: "Soil doctor",             taglineMale: "Soil health, nutrients, irrigation, sensors.",               taglineFemale: "Soil health, nutrients, irrigation, sensors." },
  { id: "vet_bridge", role: "Vet bridge",              taglineMale: "Never gives dosing — helps you decide when to call the vet.",taglineFemale: "Never gives dosing — helps you decide when to call the vet." },
  { id: "market",     role: "Selling & markets",       taglineMale: "Box schemes, farm shops, added value.",                      taglineFemale: "Box schemes, farm shops, added value." },
]

export default function AgentsPage() {
  const { profile } = useProfile()
  const gender = profile.voice_gender ?? "male"

  const cards = useMemo(
    () =>
      AGENTS.map((a) => ({
        ...a,
        name: nameForAgent(a.id, gender),
        Icon: AGENT_ICON_MAP[a.id],
        tagline: gender === "female" ? a.taglineFemale : a.taglineMale,
      })),
    [gender],
  )

  return (
    <main className="screen">
      <header className="flex flex-col gap-1">
        <p className="sec">Your farm agents</p>
        <h1 className="text-2xl font-bold">Six specialists, one companion.</h1>
        <p className="text-[color:var(--muted)]">
          Each agent has the same source-cited retrieval — they differ only in what they focus on and how they talk.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {cards.map((a) => {
          const Icon = a.Icon
          return (
            <Link
              key={a.id}
              href={`/agents/${a.id}`}
              className="card flex items-center gap-4 hover:border-[color:var(--green-600)] transition-colors"
            >
              <Icon size={64} />
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="font-bold">{a.name}</p>
                <p className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wider">
                  {a.role}
                </p>
                <p className="text-sm text-[color:var(--muted)]">{a.tagline}</p>
              </div>
              <ArrowRightIcon size={18} className="text-[color:var(--muted)] flex-shrink-0" aria-hidden />
            </Link>
          )
        })}
      </div>
    </main>
  )
}
