import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "2.0.0",
    llm: process.env.GEMINI_API_KEY ? "gemini" : "offline_tfidf",
    tts: process.env.ELEVENLABS_API_KEY ? "elevenlabs" : "browser",
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
  })
}
