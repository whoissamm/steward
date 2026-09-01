import { NextResponse } from "next/server"
import { AGENTS } from "@/lib/server/agents"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    agents: AGENTS.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      tagline: a.tagline,
      color: a.color,
      iconKey: a.iconKey,
      suggestions: a.suggestions,
      greeting: a.greeting,
    })),
  })
}
