"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useProfile } from "@/hooks/useProfile"
import { useSensors } from "@/hooks/useSensors"
import { hasOnboarded } from "@/lib/profile"
import {
  DropletIcon, ThermometerIcon, WindIcon, CloudRainIcon, AlertTriangleIcon,
  InfoIcon, RefreshCwIcon, WifiOffIcon, SproutIcon, ArrowRightIcon,
} from "lucide-react"
import { StatWidget } from "@/components/ui/stat-widget"
import { ShimmerLoader } from "@/components/ui/shimmer-loader"

export default function SensorsPage() {
  const router = useRouter()
  const { profile, loaded, update } = useProfile()
  const { readings, error, loading, refresh } = useSensors(!!profile.has_sensors && loaded)

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) router.replace("/login")
  }, [loaded, profile, router])

  if (!loaded) {
    return (
      <main className="screen">
        <div className="card"><ShimmerLoader lines={5} /></div>
      </main>
    )
  }

  if (!profile.has_sensors) {
    return (
      <main className="screen">
        <header className="flex flex-col gap-1">
          <p className="sec">Sensors</p>
          <h1 className="text-2xl font-bold">Connect a sensor to see live readings</h1>
        </header>
        <div className="card flex flex-col gap-3">
          <p className="text-sm">
            Steward can factor live soil, air and wind readings into your daily plan and advice.
            You don&apos;t have a sensor connected yet — for the demo, we can turn on the simulated
            sensor stream so you can see the panel in action.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => update({ has_sensors: true })}
            >
              Enable demo sensors
            </button>
            <Link href="/settings" className="btn-secondary">Open settings</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <p className="sec">Live sensors</p>
          <h1 className="text-2xl font-bold">On the farm right now</h1>
        </div>
        <button type="button" className="btn-ghost" onClick={refresh} aria-label="Refresh sensors">
          <RefreshCwIcon size={14} aria-hidden /> Refresh
        </button>
      </header>

      {loading && !readings && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card"><ShimmerLoader lines={3} /></div>
          ))}
        </div>
      )}

      {error && !readings && (
        <div className="card flex items-start gap-3" role="alert">
          <WifiOffIcon size={20} className="mt-1 text-[color:var(--muted)]" aria-hidden />
          <div className="flex flex-col gap-2 flex-1">
            <p className="font-semibold">Sensors offline</p>
            <p className="text-sm text-[color:var(--muted)]">{error}</p>
            <button type="button" className="btn-secondary self-start" onClick={refresh}>
              <RefreshCwIcon size={14} aria-hidden /> Retry
            </button>
          </div>
        </div>
      )}

      {readings && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          <StatWidget icon={DropletIcon} label="Soil moisture" value={readings.soil_moisture} unit="%" tone={readings.soil_moisture < 20 ? "amber" : "green"} />
          <StatWidget icon={ThermometerIcon} label="Soil temp" value={readings.soil_temp} unit="°C" tone="neutral" />
          <StatWidget icon={ThermometerIcon} label="Air temp" value={readings.air_temp} unit="°C" tone={readings.air_temp <= 2 ? "red" : "neutral"} />
          <StatWidget icon={WindIcon} label="Wind" value={readings.wind} unit="kph" tone={readings.wind > 19 ? "amber" : "neutral"} />
          <StatWidget icon={CloudRainIcon} label="Rain (24h)" value={readings.rain_24h} unit="mm" tone="neutral" />
          <StatWidget icon={CloudRainIcon} label="Forecast" value={readings.rain_forecast} unit="mm" tone="neutral" />
        </motion.section>
      )}

      {readings && readings.alerts.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="sec">Alerts</p>
          {readings.alerts.map((a) => {
            const isWarn = a.level === "warning"
            const Icon = isWarn ? AlertTriangleIcon : InfoIcon
            return (
              <div
                key={a.message}
                role="alert"
                className={
                  "flex items-start gap-2 p-3 rounded-xl text-sm " +
                  (isWarn
                    ? "bg-[color:var(--amber-50)] border border-[color:var(--amber-200)] text-[color:var(--amber-700)]"
                    : "bg-[color:var(--surface-alt)] border border-[color:var(--border)]")
                }
              >
                <Icon size={16} className="mt-0.5 flex-shrink-0" aria-hidden />
                <span>{a.message}</span>
              </div>
            )
          })}
        </section>
      )}

      <Link
        href="/agents/soil"
        className="card flex items-center gap-3 hover:border-[color:var(--green-600)] transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-[color:var(--stone-100)] text-[color:var(--stone-700)] flex items-center justify-center flex-shrink-0">
          <SproutIcon size={22} aria-hidden />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Ask the Soil Doctor</p>
          <p className="text-xs text-[color:var(--muted)]">
            Get a plain-English read on what these numbers mean today.
          </p>
        </div>
        <ArrowRightIcon size={16} className="text-[color:var(--muted)]" aria-hidden />
      </Link>
    </main>
  )
}
