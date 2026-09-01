// Best UK English voices from ElevenLabs (verified against public voices list).
// Mapped to our 11 UI accent options. The dialectify() text pre-pass adds
// regional lead-ins ("Howay,") + word substitutions, so ElevenLabs speaks the
// dialect words in the closest voice we have.

export const ELEVENLABS_DEFAULT_VOICE = "onwK4e9ZLuTAKqWW03F9" // Daniel — steady British broadcaster male

export const ACCENT_TO_VOICE: Record<string, string> = {
  standard:    "onwK4e9ZLuTAKqWW03F9", // Daniel — clear, neutral British
  southern:    "Xb7hH8MSUJpSbSDYk0k2", // Alice — British female educator, RP-ish
  geordie:     "JBFqnCBsd6RMkjVDRZzb", // George — warm British male, gruff enough for NE
  mackem:      "JBFqnCBsd6RMkjVDRZzb", // George
  durham:      "JBFqnCBsd6RMkjVDRZzb", // George
  scouse:      "IKne3meq5aSn9XLyUdCD", // Charlie — energetic, close-ish
  scots:       "onwK4e9ZLuTAKqWW03F9", // Daniel (dialectified text)
  yorkshire:   "JBFqnCBsd6RMkjVDRZzb", // George
  westcountry: "JBFqnCBsd6RMkjVDRZzb", // George — storyteller
  brummie:     "onwK4e9ZLuTAKqWW03F9", // Daniel
  cockney:     "onwK4e9ZLuTAKqWW03F9", // Daniel
}

export function voiceIdFor(accent: string): string {
  return ACCENT_TO_VOICE[accent] || ELEVENLABS_DEFAULT_VOICE
}
