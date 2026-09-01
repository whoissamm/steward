import { NextRequest, NextResponse } from "next/server"
import { dailyPlan } from "@/lib/server/plan"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const farm = url.searchParams.get("farm") ?? "mixed"
  const hasSensors = url.searchParams.get("has_sensors") === "true"
  return NextResponse.json(dailyPlan(farm, hasSensors))
}
