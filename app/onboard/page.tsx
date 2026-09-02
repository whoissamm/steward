"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AccentPicker } from "@/components/onboard/AccentPicker"
import { useProfile } from "@/hooks/useProfile"
import { accentGreetingPreview } from "@/lib/dialect"
import {
  ArrowRightIcon, ArrowLeftIcon, LeafIcon, TractorIcon, MilkIcon, CarrotIcon, ShuffleIcon,
  CheckIcon, MinusIcon, SproutIcon, MicIcon, MessageCircleIcon,
} from "lucide-react"

const FARM_TYPES = [
  { id: "arable", label: "Arable", description: "Cereals, oilseeds, pulses", Icon: TractorIcon },
  { id: "livestock", label: "Livestock", description: "Sheep, beef, other stock", Icon: LeafIcon },
  { id: "dairy", label: "Dairy", description: "Milking herd", Icon: MilkIcon },
  { id: "mixed", label: "Mixed", description: "Stock plus arable", Icon: ShuffleIcon },
  { id: "horticulture", label: "Horticulture", description: "Fruit, veg, cut flowers", Icon: CarrotIcon },
]

const TOTAL_STEPS = 4

const STEP_META = [
  { eyebrow: "Introduce yourself", title: "What should we call you?" },
  { eyebrow: "Sound of home", title: "How should Steward sound?" },
  { eyebrow: "Your setup", title: "What kind of farm?" },
  { eyebrow: "Sensors", title: "Any farm sensors?" },
]

export default function OnboardPage() {
  const router = useRouter()
  const { profile, update } = useProfile()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(profile.name || "")
  const [accent, setAccent] = useState(profile.accent || "standard")
  const [farmType, setFarmType] = useState(profile.farm_type || "mixed")
  const [voiceGender, setVoiceGender] = useState<"male" | "female">(profile.voice_gender || "male")
  const [hasSensors, setHasSensors] = useState<boolean | null>(profile.has_sensors ? true : null)

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
      voice_gender: voiceGender,
      farm_type: farmType,
      has_sensors: !!hasSensors,
      onboarded_at: new Date().toISOString(),
    })
    router.push("/home")
  }

  const meta = STEP_META[step - 1]

  return (
    <main className="screen no-nav centered">
      {/* Header strip */}
      <div className="flex items-start justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl bg-[color:var(--green-700)] text-white flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "0 6px 18px color-mix(in oklab, var(--green-600) 30%, transparent)" }}
          >
            <SproutIcon size={22} aria-hidden />
          </div>
          <div className="flex flex-col leading-tight">
            <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--muted)]">
              Steward · Set up
            </p>
            <p className="text-sm text-[color:var(--fg)]">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>
        </div>
        <div className="text-right text-[10px] text-[color:var(--muted)] leading-tight max-w-[110px]">
          Takes about 60 seconds
        </div>
      </div>

      {/* Segment progress bar */}
      <div className="grid grid-cols-4 gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label="Setup progress">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={
              "h-1.5 rounded-full transition-colors " +
              (n <= step ? "bg-[color:var(--green-700)]" : "bg-[color:var(--border)]")
            }
          />
        ))}
      </div>

      {/* Hero heading — sits directly under the top strip, not centered */}
      <AnimatePresence mode="wait">
        <motion.header
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-1 pt-2"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--green-700)]">
            {meta.eyebrow}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{meta.title}</h1>
        </motion.header>
      </AnimatePresence>

      {/* Step body */}
      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && (
            <div className="card flex flex-col gap-3">
              <p className="text-sm text-[color:var(--muted)]">
                First name is fine. Steward is a decision aid, not a licensed adviser — for regulated matters we always point you to a professional.
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
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div className="card flex flex-col gap-3">
                <p className="text-sm text-[color:var(--muted)]">
                  On-screen answers stay in plain English. Voice output uses the accent you choose. You can change this any time in Settings.
                </p>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Voice gender">
                  {(["male", "female"] as const).map((g) => {
                    const sel = voiceGender === g
                    return (
                      <button
                        key={g}
                        type="button"
                        role="radio"
                        aria-checked={sel}
                        onClick={() => setVoiceGender(g)}
                        className={
                          "px-3 py-2 rounded-xl border-2 flex items-center justify-center gap-2 font-medium capitalize " +
                          (sel
                            ? "border-[color:var(--green-700)] bg-[color:color-mix(in_oklab,var(--green-500)_10%,var(--surface))]"
                            : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)]")
                        }
                      >
                        <MicIcon size={14} aria-hidden />
                        {g} voice
                      </button>
                    )
                  })}
                </div>
              </div>
              <AccentPicker value={accent} onChange={setAccent} name={name} />
              <p className="text-sm text-[color:var(--muted)] italic px-1">
                Preview: &ldquo;{accentGreetingPreview(accent, name)}&rdquo;
              </p>
            </div>
          )}

          {step === 3 && (
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
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3">
              <div className="card">
                <p className="text-sm text-[color:var(--muted)]">
                  If you have soil-moisture or weather sensors, Steward can factor live readings into answers. You can change this later, or turn on the demo stream to see the panel in action.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  role="radio"
                  aria-checked={hasSensors === true}
                  className="choice justify-center flex-col text-center min-h-[110px]"
                  onClick={() => setHasSensors(true)}
                >
                  <CheckIcon size={26} className="text-[color:var(--green-700)]" aria-hidden />
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
                  <MinusIcon size={26} className="text-[color:var(--muted)]" aria-hidden />
                  <span className="font-semibold">Not yet</span>
                  <span className="text-xs text-[color:var(--muted)]">Skip sensor panel</span>
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* Small feature strip — reminds them what they'll get, not marketing */}
      {step === 1 && (
        <div className="flex flex-col gap-2 text-xs text-[color:var(--muted)] pt-2">
          <span className="flex items-center gap-2"><MessageCircleIcon size={12} aria-hidden className="text-[color:var(--green-700)]" /> Six specialist AI agents, one companion.</span>
          <span className="flex items-center gap-2"><MicIcon size={12} aria-hidden className="text-[color:var(--green-700)]" /> Voice-first — replies in your accent.</span>
        </div>
      )}

      {/* Inline CTA — sits under the step body since content is vertically centred */}
      <div className="flex items-center justify-between gap-3 pt-2">
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
