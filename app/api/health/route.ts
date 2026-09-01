import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    llm: process.env.GEMINI_API_KEY ? "gemini" : "offline_tfidf",
    version: "1.0.0",
  })
}
