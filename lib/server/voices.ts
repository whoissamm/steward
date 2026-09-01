// Best UK English voices from ElevenLabs (verified against public voices list).
// For each of our 11 UI accent options we pick a "male" and "female" voice
// that's the closest match. Dialectify() adjusts words before TTS.

type VoicePair = { male: string; female: string }

const DEFAULT_MALE = "onwK4e9ZLuTAKqWW03F9"   // Daniel — steady British broadcaster male
const DEFAULT_FEMALE = "Xb7hH8MSUJpSbSDYk0k2" // Alice — British female educator, RP-ish

export const ACCENT_TO_VOICE: Record<string, VoicePair> = {
  standard:    { male: DEFAULT_MALE,                       female: DEFAULT_FEMALE },
  southern:    { male: DEFAULT_MALE,                       female: DEFAULT_FEMALE },
  geordie:     { male: "JBFqnCBsd6RMkjVDRZzb",             female: "pFZP5JQG7iQjIQuC4Bku" }, // George / Lily
  mackem:      { male: "JBFqnCBsd6RMkjVDRZzb",             female: "pFZP5JQG7iQjIQuC4Bku" },
  durham:      { male: "JBFqnCBsd6RMkjVDRZzb",             female: DEFAULT_FEMALE },
  scouse:      { male: "IKne3meq5aSn9XLyUdCD",             female: "FGY2WhTYpPnrIDTdsKH5" }, // Charlie / Laura
  scots:       { male: DEFAULT_MALE,                       female: DEFAULT_FEMALE },
  yorkshire:   { male: "JBFqnCBsd6RMkjVDRZzb",             female: "pFZP5JQG7iQjIQuC4Bku" },
  westcountry: { male: "JBFqnCBsd6RMkjVDRZzb",             female: "pFZP5JQG7iQjIQuC4Bku" },
  brummie:     { male: DEFAULT_MALE,                       female: DEFAULT_FEMALE },
  cockney:     { male: DEFAULT_MALE,                       female: DEFAULT_FEMALE },
}

export function voiceIdFor(accent: string, gender: "male" | "female" = "male"): string {
  const pair = ACCENT_TO_VOICE[accent] || { male: DEFAULT_MALE, female: DEFAULT_FEMALE }
  return pair[gender]
}
