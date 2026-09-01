// Deterministic, stateless farm sensor simulator.
// Uses time-window seeding so the reading drifts realistically without any DB.
// Values roughly match a UK small-farm envelope (autumn/winter defaults).

const BOUNDS = {
  soil_moisture: [12, 40] as const,
  soil_temp: [3, 18] as const,
  air_temp: [4, 22] as const,
  wind: [2, 34] as const,
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function drift(seed: number, base: number, span: number, jitter: number): number {
  const rng = mulberry32(seed)
  const hourOfDay = (new Date(seed * 4000).getUTCHours() + 24) % 24
  // Daily sinusoid — coldest around 05:00 UTC, warmest around 15:00 UTC
  const cycle = Math.sin(((hourOfDay - 5) / 24) * Math.PI * 2) * 0.5 + 0.5
  const noise = (rng() - 0.5) * 2 * jitter
  return base + cycle * span + noise
}

function clampRound(v: number, key: keyof typeof BOUNDS): number {
  const [lo, hi] = BOUNDS[key]
  return Math.round(Math.max(lo, Math.min(hi, v)) * 10) / 10
}

export type SensorAlert = { level: "info" | "warning"; message: string }
export type SensorReadings = {
  soil_moisture: number
  soil_temp: number
  air_temp: number
  rain_24h: number
  rain_forecast: number
  wind: number
  history: number[]
  alerts: SensorAlert[]
}

function readingForSeed(seed: number): {
  soil_moisture: number
  soil_temp: number
  air_temp: number
  wind: number
  rain_24h: number
  rain_forecast: number
} {
  const rng = mulberry32(seed)
  const soil_moisture = clampRound(drift(seed + 1, 18, 6, 1.5), "soil_moisture")
  const soil_temp = clampRound(drift(seed + 2, 6, 6, 0.6), "soil_temp")
  const air_temp = clampRound(drift(seed + 3, 8, 10, 1.5), "air_temp")
  const wind = clampRound(drift(seed + 4, 10, 15, 3), "wind")
  const rain_24h = Math.round(rng() * 30) / 10
  const rain_forecast = Math.round(rng() * 80) / 10
  return { soil_moisture, soil_temp, air_temp, wind, rain_24h, rain_forecast }
}

export function getReadings(now: Date = new Date()): SensorReadings {
  const seed = Math.floor(now.getTime() / 4000)
  const current = readingForSeed(seed)
  const history: number[] = []
  for (let i = 7; i >= 0; i--) history.push(readingForSeed(seed - i).soil_moisture)

  const alerts: SensorAlert[] = []
  if (current.air_temp <= 2) {
    alerts.push({ level: "warning", message: "Frost risk tonight — protect tender crops." })
  } else if (current.soil_moisture < 20 && current.rain_forecast < 5) {
    alerts.push({ level: "info", message: "Soil is getting dry — consider irrigation soon." })
  }
  if (current.wind > 19) {
    alerts.push({ level: "warning", message: "Wind above 19 kph — hold off on spraying." })
  }

  return { ...current, history, alerts }
}

const SENSOR_QUESTION =
  /irrigat|moist|drought|rain|frost|spray|wind|cold|water|temperatur|dry/i

export function sensorContextForQuestion(question: string, readings: SensorReadings): string {
  if (!SENSOR_QUESTION.test(question)) return ""
  const parts = [
    `Soil moisture is ${readings.soil_moisture}%.`,
    `Air temperature is ${readings.air_temp}°C.`,
    `Wind is ${readings.wind} kph.`,
    `Rain forecast: ${readings.rain_forecast} mm.`,
  ]
  if (readings.air_temp <= 2) parts.push("Frost risk: yes.")
  else if (readings.soil_moisture < 20 && readings.rain_forecast < 5)
    parts.push("Irrigation looks advisable soon.")
  else if (readings.soil_moisture > 35)
    parts.push("Soil is well-watered — no irrigation needed now.")
  if (readings.wind > 19) parts.push("Too windy to spray safely.")
  return parts.join(" ")
}
