import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"
import { getClientIP } from "@/lib/request"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`categories_${ip}`, {
      interval: 60000,
      maxRequests: 60,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`

    return NextResponse.json(
      { data: categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
