import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export const runtime = "edge"
export const dynamic = "force-dynamic"
import { getClientIP } from "@/lib/request"

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const rateLimitResult = rateLimit(`projects_${ip}`, {
      interval: 60000,
      maxRequests: 30,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get("featured") === "true"
    const limit = Number(searchParams.get("limit")) || 12
    const offset = Number(searchParams.get("offset")) || 0

    let query = "SELECT * FROM projects WHERE 1=1"
    const params: any[] = []
    const paramIndex = 1

    if (featured) {
      query += " AND featured = true"
    }

    query += " ORDER BY completion_date DESC NULLS LAST, created_at DESC"
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const projects = await sql`${query}, ${params}`

    // Get total count
    const countQuery = featured
      ? "SELECT COUNT(*) as total FROM projects WHERE featured = true"
      : "SELECT COUNT(*) as total FROM projects"
    const [{ total }] = await sql`${countQuery}`

    return NextResponse.json(
      {
        data: projects,
        pagination: {
          total: Number(total),
          limit,
          offset,
          hasMore: offset + limit < Number(total),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
