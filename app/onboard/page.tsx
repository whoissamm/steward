"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AccentPicker } from "@/components/onboard/AccentPicker"
import { useProfile } from "@/hooks/useProfile"
import { greetingFor } from "@/lib/dialect"
import { ArrowRightIcon, ArrowLeftIcon, LeafIcon, TractorIcon, MilkIcon, CarrotIcon, ShuffleIcon, CheckIcon, MinusIcon } from "lucide-react"

const FARM_TYPES = [
  { id: "arable", label: "Arable", description: "Cereals, oilseeds, pulses", Icon: TractorIcon },
  { id: "livestock", label: "Livestock", description: "Sheep, beef, other stock", Icon: LeafIcon },
  { id: "dairy", label: "Dairy", description: "Milking herd", Icon: MilkIcon },
  { id: "mixed", label: "Mixed", description: "Stock plus arable", Icon: ShuffleIcon },
  { id: "horticulture", label: "Horticulture", description: "Fruit, veg, cut flowers", Icon: CarrotIcon },
]

const TOTAL_STEPS = 4

export default function OnboardPage() {
  const router = useRouter()
  const { profile, update } = useProfile()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(profile.name || "")
  const [accent, setAccent] = useState(profile.accent || "standard")
  const [farmType, setFarmType] = useState(profile.farm_type || "mixed")
  const [hasSensors, setHasSensors] = useState<boolean | null>(
    profile.has_sensors ? true : null,
  )

  const canNext =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && !!accent) ||
    (step === 3 && !!farmType) ||
    (step === 4 && hasSensors !== null)

  function next() {
    if (!canNext) return
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      return
    }
    update({
      name: name.trim(),
      accent,
      farm_type: farmType,
      has_sensors: !!hasSensors,
    })
    router.push("/home")
  }

  return (
    <main className="screen no-nav" style={{ paddingBottom: 100 }}>
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[color:var(--green-700)] text-white flex items-center justify-center font-bold">
          S
        </div>
        <div>
          <p className="text-xs text-[color:var(--muted)] font-semibold uppercase tracking-wider">
            Set up · Step {step} of {TOTAL_STEPS}
          </p>
          <h1 className="text-lg font-bold">Steward</h1>
        </div>
      </header>

      <div className="xp-track" role="progressbar" aria-label={`Setup progress: step ${step} of ${TOTAL_STEPS}`} aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
        <div className="xp-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>

      {step === 1 && (
        <section className="card flex flex-col gap-4">
          <h2 className="text-2xl font-bold leading-tight">What should we call you?</h2>
          <p className="text-[color:var(--muted)]">
            First name is fine. Steward is a decision aid, not a licensed adviser.
          </p>
          <label htmlFor="name" className="sr-only">Your name</label>
          <input
            id="name"
            className="input"
            placeholder="e.g. Sam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
            enterKeyHint="next"
            onKeyDown={(e) => { if (e.key === "Enter" && canNext) next() }}
          />
        </section>
      )}

      {step === 2 && (
        <section className="card flex flex-col gap-4">
          <h2 className="text-2xl font-bold leading-tight">How should Steward sound?</h2>
          <p className="text-[color:var(--muted)]">
            On-screen answers stay in plain English. Voice output uses the accent you choose.
          </p>
          <AccentPicker value={accent} onChange={setAccent} name={name} />
          <p className="text-sm text-[color:var(--muted)] italic">
            Preview: &ldquo;{greetingFor(accent, name)}&rdquo;
          </p>
        </section>
      )}

      {step === 3 && (
        <section className="card flex flex-col gap-4">
          <h2 className="text-2xl font-bold leading-tight">What kind of farm?</h2>
          <p className="text-[color:var(--muted)]">
            We use this to tailor your daily plan and suggested questions.
          </p>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Farm type">
            {FARM_TYPES.map((t) => {
              const selected = farmType === t.id
              const Icon = t.Icon
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className="choice"
                  onClick={() => setFarmType(t.id)}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={22} className="text-[color:var(--green-700)]" aria-hidden />
                    <div className="flex flex-col">
                      <span className="font-semibold">{t.label}</span>
                      <span className="text-sm text-[color:var(--muted)]">{t.description}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="card flex flex-col gap-4">
          <h2 className="text-2xl font-bold leading-tight">Any farm sensors?</h2>
          <p className="text-[color:var(--muted)]">
            If you have soil-moisture or weather sensors, Steward can factor live readings into answers. You can change this later.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              role="radio"
              aria-checked={hasSensors === true}
              className="choice justify-center flex-col text-center min-h-[110px]"
              onClick={() => setHasSensors(true)}
            >
              <CheckIcon size={28} className="text-[color:var(--green-700)]" aria-hidden />
              <span className="font-semibold">Yes</span>
              <span className="text-xs text-[color:var(--muted)]">Show sensor panel</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={hasSensors === false}
              className="choice justify-center flex-col text-center min-h-[110px]"
              onClick={() => setHasSensors(false)}
            >
              <MinusIcon size={28} className="text-[color:var(--muted)]" aria-hidden />
              <span className="font-semibold">Not yet</span>
              <span className="text-xs text-[color:var(--muted)]">Skip sensor panel</span>
            </button>
          </div>
        </section>
      )}

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-[color:var(--bg)] border-t border-[color:var(--border)] flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          <ArrowLeftIcon size={16} aria-hidden /> Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={next}
          disabled={!canNext}
        >
          {step === TOTAL_STEPS ? "Finish" : "Continue"}
          <ArrowRightIcon size={16} aria-hidden />
        </button>
      </div>
    </main>
  )
}
