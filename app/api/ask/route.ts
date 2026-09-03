import { NextRequest, NextResponse } from "next/server"
import { checkGuards, normaliseDialect } from "@/lib/server/guardrails"
import { askInternal, type AgentAction } from "@/lib/server/reasoning"
import { getReadings, sensorContextForQuestion } from "@/lib/server/sensors"
import { checkBadges, levelFor, tipForTurn } from "@/lib/server/gamification"
import { isMarketQuery } from "@/lib/server/topics"

export const runtime = "nodejs"
export const maxDuration = 30

type AskBody = {
  text: string
  agent_id?: string
  behaviour_summary?: string
  profile_context?: string
  voice_gender?: "male" | "female"
  image_base64?: string
  image_mime?: string
  history?: { role: "user" | "assistant"; text: string }[]
  profile?: {
    id?: string
    points?: number
    turns?: number
    badges?: string[]
    has_sensors?: boolean
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as AskBody
  const text = (body.text ?? "").toString().trim()
  const agentId = body.agent_id || "steward"
  const behaviourSummary = body.behaviour_summary
  const profileContext = body.profile_context
  const imageBase64 = body.image_base64
  const imageMime = body.image_mime
  const profile = body.profile ?? {}
  const currentBadges = new Set(profile.badges ?? [])

  if (!text && !imageBase64) {
    return NextResponse.json({ error: "text or image is required" }, { status: 400 })
  }

  const normalised = normaliseDialect(text)
  const guard = checkGuards(normalised)
  const turns = (profile.turns ?? 0) + 1

  if (guard.blocked) {
    const newBadges: string[] = []
    if (!currentBadges.has("careful")) newBadges.push("careful")
    for (const b of checkBadges({
      turns,
      points: profile.points ?? 0,
      badges: [...currentBadges, ...newBadges],
    })) if (!newBadges.includes(b)) newBadges.push(b)

    return NextResponse.json({
      answer: guard.message,
      sources: [],
      confidence: "high",
      topic: guard.isCrisis ? "wellbeing" : "records",
      why: "",
      abstained: false,
      blocked: true,
      is_crisis: guard.isCrisis,
      followups: [],
      tip: null,
      new_badges: newBadges,
      points_earned: 0,
      total_points: profile.points ?? 0,
      level: levelFor(profile.points ?? 0),
      agent: agentId,
      llm: "guardrail",
      actions: [] as AgentAction[],
    })
  }

  let sensorContext = ""
  let sensorUsed = false
  if (profile.has_sensors) {
    const readings = getReadings()
    sensorContext = sensorContextForQuestion(normalised, readings)
    if (sensorContext) sensorUsed = true
  }

  const result = await askInternal(text || "See attached image and advise.", {
    agentId,
    sensorContext,
    behaviourSummary,
    profileContext,
    imageBase64,
    imageMime,
    voiceGender: body.voice_gender,
    history: body.history,
  })

  const pointsEarned = 5
  const nextPoints = (profile.points ?? 0) + pointsEarned
  const newBadges: string[] = []
  if (sensorUsed && !currentBadges.has("data")) newBadges.push("data")
  if (result.abstained && !currentBadges.has("careful")) newBadges.push("careful")
  if (isMarketQuery(normalised) && !currentBadges.has("market")) newBadges.push("market")
  for (const b of checkBadges({
    turns,
    points: nextPoints,
    badges: [...currentBadges, ...newBadges],
  })) if (!newBadges.includes(b)) newBadges.push(b)

  const tip = turns % 2 === 0 ? tipForTurn(turns) : null

  return NextResponse.json({
    answer: result.answer,
    sources: result.sources,
    confidence: result.confidence,
    topic: result.topic,
    why: result.why,
    abstained: result.abstained,
    blocked: false,
    is_crisis: false,
    followups: result.followups,
    tip,
    new_badges: newBadges,
    points_earned: pointsEarned,
    total_points: nextPoints,
    level: levelFor(nextPoints),
    agent: result.agent,
    llm: result.llm,
    actions: result.actions,
  })
}
