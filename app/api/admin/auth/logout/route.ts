import { type NextRequest, NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

export const runtime = "edge"

// POST /api/admin/auth/logout
export async function POST(request: NextRequest) {
  try {
    await destroySession()

    return NextResponse.json({ message: "Logout successful" })
  } catch (error) {
    console.error("[v0] Admin logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
