import { NextResponse } from "next/server"
import { refreshSession } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST() {
  try {
    const ok = await refreshSession()
    if (!ok) return NextResponse.json({ error: "Session not found or expired" }, { status: 401 })

    return NextResponse.json({ message: "Session refreshed" })
  } catch (error) {
    console.error("[v0] Admin refresh error:", error)
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 })
  }
}
