"use client"

import { useMemo, useRef, useEffect } from "react"
import { useSensors } from "@/hooks/useSensors"
import { DropletIcon, ThermometerIcon, WindIcon, CloudRainIcon, AlertTriangleIcon, InfoIcon, RefreshCwIcon, WifiOffIcon } from "lucide-react"

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const w = 100
  const h = 24
  const step = w / (values.length - 1)
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / span) * h}`).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-6 spark" aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Card({
  Icon,
  label,
  value,
  unit,
  spark,
}: {
  Icon: React.ElementType
  label: string
  value: number
  unit: string
  spark?: number[]
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="flex items-center gap-2 text-[color:var(--muted)]">
        <Icon size={14} aria-hidden />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-xs text-[color:var(--muted)]">{unit}</span>
      </div>
      {spark && <Sparkline values={spark} />}
    </div>
  )
}

export function SensorPanel() {
  const { readings, error, loading, refresh } = useSensors(true)
  const priorAlerts = useRef<string[]>([])
  const alertKeys = useMemo(
    () => (readings?.alerts ?? []).map((a) => `${a.level}:${a.message}`),
    [readings],
  )

  useEffect(() => {
    priorAlerts.current = alertKeys
  }, [alertKeys])

  if (loading && !readings) {
    return (
      <section className="card flex flex-col gap-3">
        <p className="sec">Live sensors</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
      </section>
    )
  }

  if (error && !readings) {
    return (
      <section className="card flex flex-col gap-3" role="alert">
        <p className="sec">Live sensors</p>
        <p className="text-sm flex items-start gap-2">
          <WifiOffIcon size={14} className="mt-0.5 text-[color:var(--muted)]" aria-hidden />
          <span>Sensors offline — {error}</span>
        </p>
        <button type="button" className="btn-secondary self-start" onClick={refresh}>
          <RefreshCwIcon size={14} aria-hidden /> Retry
        </button>
      </section>
    )
  }

  if (!readings) return null

  return (
    <section className="card flex flex-col gap-3" aria-label="Farm sensors">
      <div className="flex items-center justify-between">
        <p className="sec">Live sensors</p>
        <span className={"chip " + (error ? "chip-amber" : "chip-green")}>
          {error ? "Reconnecting…" : "Live"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Card Icon={DropletIcon} label="Soil moisture" value={readings.soil_moisture} unit="%" spark={readings.history} />
        <Card Icon={ThermometerIcon} label="Soil temp" value={readings.soil_temp} unit="°C" />
        <Card Icon={ThermometerIcon} label="Air temp" value={readings.air_temp} unit="°C" />
        <Card Icon={WindIcon} label="Wind" value={readings.wind} unit="kph" />
      </div>
      <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
        <CloudRainIcon size={12} aria-hidden />
        <span>Rain 24h: {readings.rain_24h} mm · Forecast: {readings.rain_forecast} mm</span>
      </div>
      {readings.alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {readings.alerts.map((a) => {
            const key = `${a.level}:${a.message}`
            const isNew = !priorAlerts.current.includes(key)
            const isWarn = a.level === "warning"
            const Icon = isWarn ? AlertTriangleIcon : InfoIcon
            return (
              <div
                key={key}
                role={isNew ? "status" : undefined}
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
        </div>
      )}
    </section>
  )
}
