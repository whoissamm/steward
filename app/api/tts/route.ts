import { NextRequest, NextResponse } from "next/server"
import { voiceIdFor } from "@/lib/server/voices"
import { dialectify } from "@/lib/dialect"

export const runtime = "nodejs"
export const maxDuration = 30

type Body = { text: string; accent?: string; gender?: "male" | "female" }

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body
  const text = (body.text ?? "").toString().trim()
  const accent = body.accent ?? "standard"
  const gender = body.gender === "female" ? "female" : "male"
  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 })

  // Dialectify BEFORE ElevenLabs so the voice says "howay/aye/etc." with matching cadence.
  const spoken = dialectify(text, accent)

  const key = process.env.ELEVENLABS_API_KEY
  if (!key) {
    return NextResponse.json({
      use_browser_tts: true,
      dialect_text: spoken,
      plain_text: text,
    })
  }

  const voice = voiceIdFor(accent, gender)
  const model = process.env.ELEVENLABS_MODEL || "eleven_turbo_v2_5"

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: spoken,
          model_id: model,
          voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.25 },
        }),
      },
    )
    if (!upstream.ok || !upstream.body) {
      const err = await upstream.text().catch(() => "")
      console.error("elevenlabs http", upstream.status, err.slice(0, 200))
      return NextResponse.json({
        use_browser_tts: true,
        dialect_text: spoken,
        plain_text: text,
        error: `elevenlabs_${upstream.status}`,
      })
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("tts route failed", err)
    return NextResponse.json({
      use_browser_tts: true,
      dialect_text: spoken,
      plain_text: text,
      error: (err as Error).message,
    })
  }
}
