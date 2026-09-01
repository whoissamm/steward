import { NextRequest, NextResponse } from "next/server"
import { checkBadges, levelFor, tipForTurn } from "@/lib/server/gamification"

export const runtime = "nodejs"

const POINTS: Record<string, number> = {
  todo_done: 5,
  lesson_done: 5,
  quiz_correct: 10,
  voice_used: 0,
  market_query: 0,
}

type ProgressBody = {
  action: string
  item_id?: string | null
  profile?: {
    points?: number
    turns?: number
    badges?: string[]
    lesson_done?: string[]
    quiz_done?: string[]
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as ProgressBody
  const action = body.action
  const itemId = body.item_id ?? null
  const profile = body.profile ?? {}

  let pts = POINTS[action] ?? 0
  const doneLesson = new Set(profile.lesson_done ?? [])
  const doneQuiz = new Set(profile.quiz_done ?? [])

  if (action === "lesson_done" && itemId && doneLesson.has(itemId)) pts = 0
  if (action === "quiz_correct" && itemId && doneQuiz.has(itemId)) pts = 0

  const newBadges: string[] = []
  const currentBadges = new Set(profile.badges ?? [])
  if (action === "voice_used" && !currentBadges.has("voice")) newBadges.push("voice")

  const nextPoints = (profile.points ?? 0) + pts
  const passiveBadges = checkBadges({
    points: nextPoints,
    turns: profile.turns ?? 0,
    badges: [...currentBadges, ...newBadges],
  })
  for (const b of passiveBadges) if (!newBadges.includes(b)) newBadges.push(b)

  return NextResponse.json({
    points: pts,
    total_points: nextPoints,
    level: levelFor(nextPoints),
    new_badges: newBadges,
    tip: tipForTurn(profile.turns ?? 0),
  })
}
