import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// GET /api/admin/auth/me - Get current admin user
export async function GET(request: NextRequest) {
  try {
    const admin = await validateSession()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ user: admin })
  } catch (error) {
    console.error("[v0] Get current admin error:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}
