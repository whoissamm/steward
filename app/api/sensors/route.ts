import { NextResponse } from "next/server"
import { getReadings } from "@/lib/server/sensors"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json(getReadings())
}
